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

        return $builder->display(true);
    }
  }

  public function buildTopModal(){
    return (new \Qs\ModalButton\ModalButtonBuilder())
                ->setTitle("新增")
                ->setBody($this->add());
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

        return $builder->display(true);
    }
  }
  
  public function buildEditFormModal($id ){
    return (new \Qs\ModalButton\ModalButtonBuilder())
        ->setBody($this->edit($id))
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

        $this->ajaxReturn(['status' => 1, 'info' => $builder->display(true)];
    }
  }
  
  public function buildEditFormModalWithApi($id){
    return (new \Qs\ModalButton\ModalButtonBuilder())
        ->setBodyApiUrl(U('edit', ['id' => $id]))
        ->setKeyboard(false)
        ->setBackdrop(false)
        ->setIsForward(false)
        ->setTitle('编辑');
    }
  
  $info = D('User')->getOne($id);
  $info['form_edit_form'] = $this->buildEditFormModalWithApi($info['id'])
   // 表单数据需要定义'form_edit_form'的值，且该值为ModalButtonBuilder对象 
   (new \Qscmf\Builder\FormBuilder())
  ->addButton('modal',['title' => '编辑'], '', '', 'form_edit_form')
  ->setFormData($info)
  ```