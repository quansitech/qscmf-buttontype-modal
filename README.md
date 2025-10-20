# qscmf-buttontype-modal

```text
qscmf 按钮类型组件--modal

可以向列表顶部、列表行、表单页添加此类型按钮
```

#### 安装

```php
composer require quansitech/qscmf-buttontype-modal
```

#### 添加按钮

[ModalButtonBuilder使用说明](https://github.com/quansitech/qscmf-buttontype-modal/blob/master/ModalButtonBuilder.md)

+ 向列表添加一个顶部按钮
  
  ```php
  public function add(){
    if (IS_POST) {
        // 业务逻辑
    }
    else {
        // 使用FormBuilder快速建立表单页面。
        $builder = new \Qscmf\Builder\FormBuilder();
        $builder
            ->setPostUrl(U('add'))
            ->addFormItem('nick_name', 'text', '用户名*')
            ->addFormItem('email', 'text', '电子邮箱*')
            ->addFormItem('telephone', 'text', '手机')
            ->addFormItem('pwd', 'password', '密码*')
            ->addFormItem('pwd1', 'password', '重复密码*')
            ->setShowBtn(false);
  
        return $builder;
    }
  }
  
  public function buildTopModal(){
    return (new \Qs\ModalButton\ModalButtonBuilder())
                ->setTitle("新增")
                ->bindFormBuilder($this->add());
  }
  
  // 按钮options属性传入ModalButtonBuilder对象 
   (new \Qscmf\Builder\ListBuilder())->addTopButton('modal', ['title' => '新增'],'','',$this->buildTopModal())
  ```

+ 向列表添加一个行按钮
  
  ```php
  public function edit($id){
    if (IS_POST) {
        // 业务逻辑
    }
    else {
        $info = D('User')->getOne($id);
        // 使用FormBuilder快速建立表单页面。
        $builder = new \Qscmf\Builder\FormBuilder();
        $builder
            ->setPostUrl(U('add'))
            ->addFormItem('nick_name', 'text', '用户名*')
            ->addFormItem('email', 'text', '电子邮箱*')
            ->addFormItem('telephone', 'text', '手机')
            ->addFormItem('pwd', 'password', '密码*')
            ->addFormItem('pwd1', 'password', '重复密码*')
            ->setFormData($info)
            ->setShowBtn(false);
  
        return $builder;
    }
  }
  
  public function buildEditFormModal($id ){
    return (new \Qs\ModalButton\ModalButtonBuilder())
        ->bindFormBuilder($this->edit($id))
        ->setKeyboard(false)
        ->setBackdrop(false)
        ->setTitle('编辑');
    }
  
  $data_list = D('User')->select();
  foreach($data_list as &$data){
    $right_edit_form_modal = $this->buildEditFormModal($data['id']);
    $data['list_edit_form'] = $right_edit_form_modal;
  }
  // 每一行数据需要定义'list_edit_form'的值，且该值为ModalButtonBuilder对象 
   (new \Qscmf\Builder\ListBuilder())
  ->addRightButton('modal',['title' => '编辑'], '', '', 'list_edit_form')
  ->setTableDataList($data_list)
  ```

+ 向表单添加一个按钮
  
  ```php
    public function edit($id){
    if (IS_POST) {
        // 业务逻辑
    }
    else {
        $info = D('User')->getOne($id);
        // 使用FormBuilder快速建立表单页面。
        $builder = new \Qscmf\Builder\FormBuilder();
        $builder
            ->setPostUrl(U('add'))
            ->addFormItem('nick_name', 'text', '用户名*')
            ->addFormItem('email', 'text', '电子邮箱*')
            ->addFormItem('telephone', 'text', '手机')
            ->addFormItem('pwd', 'password', '密码*')
            ->addFormItem('pwd1', 'password', '重复密码*')
            ->setFormData($info)
            ->setShowBtn(false);
  
        return $builder;
    }
  }
  
  public function buildEditFormModal($id){
    return (new \Qs\ModalButton\ModalButtonBuilder())
        ->bindFormBuilder($this->edit($id))
        ->setKeyboard(false)
        ->setBackdrop(false)
        ->setIsForward(false)
        ->setTitle('编辑');
    }
  
  $info = D('User')->getOne($id);
  $info['form_edit_form'] = $this->buildEditFormModal($info['id'])
   // 表单数据需要定义'form_edit_form'的值，且该值为ModalButtonBuilder对象 
   (new \Qscmf\Builder\FormBuilder())
  ->addButton('modal',['title' => '编辑'], '', '', 'form_edit_form')
  ->setFormData($info)
  ```

+ ajax的方式加载内容 (实验性功能)
  
  > 1. 接口说明
  >    
  >    > + 需要返回JSON数据格式
  >    > + 若数据正常则设置status为1，否则为0
  >    > + 将需要返回的内容赋值给info
  > 
  > 2. 用例
  > 
  > ```php
  > // 设置Modal 内容请求API
  >  protected function buildTopModal(){
  >      return (new \Qs\ModalButton\ModalButtonBuilder())
  >            ->setTitle("新增")
  >            ->setBackdrop(false)
  >            ->setKeyboard(false)
  >            ->setBodyApiUrl(U("add"));
  >  }
  > 
  >  // ListBuilder对应列配置
  >  ->addTopButton('modal', ['title' => '新增'],'','',$this->buildTopModal());
  > 
  > public function add(){
  > 
  >    $builder = new FormBuilder();
  >    $builder
  >        ->addFormItem('title', 'text', '标题')
  >        ->addFormItem('summary', 'textarea', '简介')
  >        ->addFormItem('cover', 'picture', '封面', '尺寸为214*250px', ['width' => 214, 'height' => 250])
  >        ->setFormData($info)
  >        ->setShowBtn(false)
  >        ->setReadOnly(true);
  > 
  >    $this->ajaxReturn(['status' => 1, 'info' => $builder->build(true)]);
  > }
  > ```

+ 模态框表单获取ListBuilder选中的checkbox值
  + 按钮添加样式类 inject_selected
  + 可使用ModalButtonBuilder对象的setSelectedIdFieldName方法自定义对应的表单字段值，默认为 qslb_selected_ids
  + 用法
    ```php
    $builder = new \Qscmf\Builder\ListBuilder();
    $builder = $builder->setMetaTitle('可编辑测试列表');
    $builder
            ->addTopButton('modal', ['title' => '新增', 'class' => "btn btn-primary inject_selected"],'','',$this->buildAddModal());
    
    
    protected function buildAddModal(){
        $modal = (new \Qs\ModalButton\ModalButtonBuilder());
        return
            $modal
                ->setTitle('新增可编辑测试')
                ->setBackdrop(false)
                ->setKeyboard(false)
                ->setSelectedIdFieldName("org_id")
                ->bindFormBuilder($this->add());
    }
  
    public function add(){
        $builder = new FormBuilder();
        $builder
                ->addFormItem('title', 'text', '标题')
                ->addFormItem('summary', 'textarea', '简介')
                ->addFormItem('cover', 'picture', '封面', '尺寸为214*250px', ['width' => 214, 'height' => 250])
                ->setFormData($info)
                ->setShowBtn(false);
                
            return $builder;
        }
    }
  
    ```

+ 添加上一条/下一条切换按钮
  + 添加切换按钮，可自定义标题及其样式
  + 接口需返回表单HTML并处理切换失败的情况
  + 用法
      
    ```php
    public function edit($id=null) {
        $modal = (new \Qs\ModalButton\ModalButtonBuilder());
        
        return $modal
            ->setTitle('审核')
            ->setBackdrop(false)
            ->setKeyboard(false)
            ->bindFormBuilder($this->edit($id))
            // 添加切换按钮，使用默认的按钮配置
            ->addPrevButton(U('edit'), $id)
            
            // 添加切换按钮，可自定义标题及其样式
            ->addNextButton(U('edit'), $id, "下一条", ['type' => 'button', 'class' => 'btn btn-secondary', 
              'href' => U('edit')], 'id')
            ;
    }

    public function edit($id=null) {
        if (IS_POST) {
            // 省略其他业务逻辑处理
        } else {
            $operate_type = I("get.operate_type");
            [$map, $order] = match($operate_type){
                'prev' => [['id' => ['LT', $id]], "id desc"],
                'next' => [['id' => ['GT', $id]], "id desc"],
                default => [['id' => ['EQ', $id]], "id desc"],
            };

            $info = D('User')->where($map)->order($order)->find();
            if($operate_type && $operate_type!=='original' empty($info)){
              $error =   match($operate_type){
                'prev' => "已经是第一条",
                'next' => "已经是最后一条",
              };
              $this->ajaxReturn(['status' => 0, 'info' => $error]);
            }

            $builder = new \Qscmf\Builder\FormBuilder();
            
            // 省略添加表单字段
            $this->addBuilderFormItem($builder);

            $builder->setMetaTitle('')
                ->setPostUrl(U('edit'))
                ->addFormItem('id', 'hidden', 'ID')
                ->setFormData($info)
                ->setShowBtn(false);

            if(empty($operate_type)){
                return $builder;
            }else{
                // 关键：返回构建好的 HTML 字符串

                $this->ajaxReturn(['status' => 1, 'info' => $builder->build(true)]);
            }
        }
    }
    ```

#### 升级指南

[升级指南](https://github.com/quansitech/qscmf-buttontype-modal/blob/master/Upgrade.md)
