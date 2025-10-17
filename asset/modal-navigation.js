/**
 * 模态框导航管理器
 * 基于按钮的 data-current-id 属性管理状态，降低与表单的耦合
 */

// URL 构建器 - 提取公共逻辑
const ModalUrlBuilder = {
    // 构建导航请求URL
    buildNavigationUrl(baseUrl, idKey, currentId, operateType) {
        if (!baseUrl) {
            throw new Error('baseUrl is required');
        }
        
        const url = new URL(baseUrl, window.location.origin);
        url.searchParams.set(idKey, currentId);
        url.searchParams.set('operate_type', operateType);
        return url.toString();
    }
};

// DOM 缓存管理器 - 优化 DOM 操作性能
class DomCacheManager {
    constructor(modalDom) {
        this.modalDom = modalDom;
        this.cache = new Map();
    }
    
    // 获取缓存的 DOM 元素
    getCachedElement(selector) {
        if (!this.cache.has(selector)) {
            this.cache.set(selector, this.modalDom.find(selector));
        }
        return this.cache.get(selector);
    }
    
    // 清除缓存
    clearCache() {
        this.cache.clear();
    }
}

// 导航状态管理器
const ModalNavigationManager = {
    // 获取当前ID（从按钮属性）
    getCurrentId(button) {
        console.log('getCurrentId',  button.attr('data-current-id'));
        return button.attr('data-current-id') || '';
    },
    
    // 更新当前ID（到按钮属性）
    updateCurrentId(button, newId) {
        console.log('updateCurrentId',  newId);

        button.attr('data-current-id', newId);
        return newId;
    },
    
    // 同步更新所有相关按钮的当前ID
    syncCurrentId(modalDom, newId) {
        modalDom.find('.qscmf_modal_nav_btn').each(function() {
            console.log('syncCurrentId',  newId);

            this.updateCurrentId($(this), newId);
        });
        return newId;
    },
    
    // 更新按钮状态
    updateButtonStates(modalDom, hasPrev, hasNext) {
        const prevBtn = modalDom.find('.qscmf_modal_nav_prev_btn');
        const nextBtn = modalDom.find('.qscmf_modal_nav_next_btn');

        console.log('updateButtonStates', prevBtn, hasPrev, nextBtn, hasNext);
        
        // 更新禁用状态
        prevBtn.prop('disabled', hasPrev === 0);
        nextBtn.prop('disabled', hasNext === 0);
    }
};

// 内容更新器
const ModalContentUpdater = {
    // 更新模态框内容
    updateContent(modalDom, content) {
        const infoContainer = modalDom.find('.modal-body .button-modal-body-info');
        infoContainer.html(content);
        
        // 重新绑定表单相关功能
        this.rebindFormFunctions(modalDom);
    },
    
    // 重新绑定表单功能
    rebindFormFunctions(modalDom) {
        // 重新绑定表单提交
        const submitBtn = modalDom.find('.modal-footer .submitModal');
        const form = modalDom.find('.modal-body form');
        
        if (submitBtn.length && form.length) {
            form.addClass(submitBtn.attr('target-form'));
        }
        
        // 重新绑定其他可能需要的事件
        this.triggerContentUpdated(modalDom);
    },
    
    // 触发内容更新事件
    triggerContentUpdated(modalDom) {
        modalDom.trigger('modal.content.updated');
    },

    // 重置模态框导航状态到初始状态
    resetNavigationState(modalDom) {
        // 检查是否存在导航按钮
        const navButtons = modalDom.find('.qscmf_modal_nav_btn');
        if (navButtons.length > 0) {
            // 重置所有导航按钮的当前ID为原始ID
            navButtons.each(function() {
                const origId = $(this).attr('data-original-id');
                if (origId !== undefined) {
                    ModalNavigationManager.updateCurrentId($(this), origId);
                }
            });

            // 重新加载模态框内容以显示原始记录
            this.reloadOriginalContent(modalDom);
        }
    },

    // 重新加载原始内容
    reloadOriginalContent(modalDom) {
        const infoDom = modalDom.find('.modal-body .button-modal-body-info');

        // 使用第一个导航按钮来构建原始内容URL
        const firstNavBtn = modalDom.find('.qscmf_modal_nav_btn:first');
        if (firstNavBtn.length > 0) {
            const idKey = firstNavBtn.attr('data-id-key') || 'id';
            const origId = firstNavBtn.attr('data-original-id') || firstNavBtn.attr('data-current-id');
            const baseUrl = firstNavBtn.attr('href');

            if (baseUrl) {
                const url = ModalUrlBuilder.buildNavigationUrl(baseUrl, idKey, origId, 'original');

                modalDom.find('.preloader').removeClass('hidden');
                infoDom.html('');

                // 使用共享的 ajaxPromise 和 loadedPromise 函数
                if (typeof ajaxPromise === 'function') {
                    ajaxPromise(url).then(function(res){
                        modalDom.find('.preloader').addClass('hidden');
                        var mainDom = $("<div>" + res.info + "</div>");
                        var scriptSrcDom = mainDom.find('script[src]');

                        return loadedPromise(scriptSrcDom, infoDom, mainDom);
                    }).then(function(dom){
                        infoDom.html(dom.html());
                        // 使用共享的 injectSubmitTargetFormClass 函数
                        if (typeof injectSubmitTargetFormClass === 'function') {
                            injectSubmitTargetFormClass(modalDom);
                        }
                    }).catch(function(res){
                        console.log(res);
                        alert(res.info || '错误，请联系管理员');
                    });
                }
            }
        }
    }
};

// 导航处理器（主类）
class ModalNavigation {
    constructor() {
        this.isProcessing = false;
        this.domCache = null;
    }
    
    // 初始化导航功能
    init(modalDom) {
        // 初始化 DOM 缓存
        this.domCache = new DomCacheManager(modalDom);
        this.bindNavigationButtons(modalDom);
    }
    
    // 绑定导航按钮事件
    bindNavigationButtons(modalDom) {
        modalDom.find('.qscmf_modal_nav_btn')
            .off('click.navigation')
            .on('click.navigation', this.handleNavigationClick.bind(this));
    }
    
    // 处理导航点击
    async handleNavigationClick(event) {
        event.preventDefault();
        
        const button = $(event.currentTarget);
        const modalDom = button.closest('.modal');
        
        // 防止重复点击
        if (this.isProcessing) return;
        
        await this.processNavigation(modalDom, button);
    }
    
    // 处理导航流程
    async processNavigation(modalDom, button) {
        try {
            this.isProcessing = true;
            this.setLoadingState(modalDom, true);
            
            // 构建请求
            const requestConfig = this.buildRequestConfig(modalDom, button);
            
            // 发送请求
            const response = await this.sendNavigationRequest(requestConfig.url);
            
            // 更新界面
            this.updateNavigationInterface(modalDom, button, response, requestConfig.idKey);
            
        } catch (error) {
            this.handleNavigationError(modalDom, error);
        } finally {
            this.isProcessing = false;
            this.setLoadingState(modalDom, false);
        }
    }
    
    // 构建请求配置
    buildRequestConfig(modalDom, button) {
        const idKey = button.attr('data-id-key') || 'id';
        const currentId = ModalNavigationManager.getCurrentId(button);
        const operateType = button.attr('data-operate-type');
        const baseUrl = button.attr('href');
        
        return {
            idKey,
            currentId,
            url: ModalUrlBuilder.buildNavigationUrl(baseUrl, idKey, currentId, operateType)
        };
    }
    
    // 发送导航请求
    sendNavigationRequest(url) {
        return new Promise((resolve, reject) => {
            if (typeof ajaxPromise !== 'function') {
                reject(new Error('ajaxPromise function is not available'));
                return;
            }
            
            ajaxPromise(url).then(resolve).catch(reject);
        });
    }
    
    // 更新导航界面
    updateNavigationInterface(modalDom, button, response, idKey) {
        // 更新内容
        ModalContentUpdater.updateContent(modalDom, response.info);
        
        // 更新导航状态（基于接口返回）
        if (response[idKey] !== undefined) {
            // 同步更新所有按钮的当前ID
            ModalNavigationManager.syncCurrentId(modalDom, response[idKey]);
            
            // 更新按钮状态
            ModalNavigationManager.updateButtonStates(
                modalDom, 
                response?.has_prev, 
                response?.has_next
            );
        }
    }
    
    // 设置加载状态
    setLoadingState(modalDom, isLoading) {
        const preloader = this.domCache ? 
            this.domCache.getCachedElement('.preloader') : 
            modalDom.find('.preloader');
            
        const buttons = this.domCache ? 
            this.domCache.getCachedElement('.qscmf_modal_nav_btn') : 
            modalDom.find('.qscmf_modal_nav_btn');
        
        if (isLoading) {
            preloader.removeClass('hidden');
            buttons.addClass('loading').prop('disabled', true);
        } else {
            preloader.addClass('hidden');
            buttons.removeClass('loading').prop('disabled', false);
        }
    }
    
    // 处理导航错误
    handleNavigationError(modalDom, error) {
        console.error('Modal navigation error:', error);
        alert(error.info || '操作失败，请重试');
    }
}

// 创建单例实例
const modalNavigation = new ModalNavigation();

// 导出主要函数（保持与原有接口兼容）
function bindPrevNextButtons(modalDom) {
    modalNavigation.init(modalDom);
}

// 统一导出方式
window.ModalNavigation = {
    bindPrevNextButtons,
    manager: ModalNavigationManager,
    updater: ModalContentUpdater,
    urlBuilder: ModalUrlBuilder,
    navigation: modalNavigation
};
