/**
 * 模态框导航管理器
 * 基于按钮的 data-current-id 属性管理状态，降低与表单的耦合
 */

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

            $(this).attr('data-current-id', newId);
        });
        return newId;
    },
    
    // 更新按钮状态
    updateButtonStates(modalDom, hasPrev, hasNext) {
        const prevBtn = modalDom.find('.qscmf_modal_nav_prev_btn');
        const nextBtn = modalDom.find('.qscmf_modal_nav_next_btn');

        console.log('updateButtonStates', hasPrev, hasNext);
        
        // 更新禁用状态
        prevBtn.prop('disabled', !hasPrev);
        nextBtn.prop('disabled', !hasNext);
        
        // 更新视觉样式
        prevBtn.toggleClass('btn-secondary', !hasPrev).toggleClass('btn-primary', hasPrev);
        nextBtn.toggleClass('btn-secondary', !hasNext).toggleClass('btn-primary', hasNext);
        
        // 更新提示文本
        prevBtn.attr('title', hasPrev ? '上一条' : '已经是第一条');
        nextBtn.attr('title', hasNext ? '下一条' : '已经是最后一条');
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
    }
};

// 导航处理器（主类）
class ModalNavigation {
    constructor() {
        this.isProcessing = false;
    }
    
    // 初始化导航功能
    init(modalDom) {
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
            url: this.buildRequestUrl(baseUrl, idKey, currentId, operateType)
        };
    }
    
    // 构建请求URL
    buildRequestUrl(baseUrl, idKey, currentId, operateType) {
        const url = new URL(baseUrl, window.location.origin);
        url.searchParams.set(idKey, currentId);
        url.searchParams.set('operate_type', operateType);
        return url.toString();
    }
    
    // 发送导航请求
    sendNavigationRequest(url) {
        return new Promise((resolve, reject) => {
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
                response.has_prev || false, 
                response.has_next || false
            );
        }
    }
    
    // 设置加载状态
    setLoadingState(modalDom, isLoading) {
        const preloader = modalDom.find('.preloader');
        const buttons = modalDom.find('.qscmf_modal_nav_btn');
        
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

// 导出其他可能需要的功能
window.ModalNavigation = {
    bindPrevNextButtons,
    manager: ModalNavigationManager,
    updater: ModalContentUpdater
};
