## ModalButtonBuilder
```text
构建一个模态框
```

带有表单的模态框

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


return (new \Qs\ModalButton\ModalButtonBuilder())
            ->setTitle("自定义标题")
            ->setBody($this->add());
```

+ 表单使用select2组件，需要修改宽度和dropdownParent属性

  ```php
  protected function buildTopModal(){
    $modal = (new \Qs\ModalButton\ModalButtonBuilder());
    return $modal
        ->setTitle('新增modal')
        ->setKeyboard(false)
        ->setBackdrop(false)
        ->setBody($this->add($modal->getModalDom()));
  }
  
  public function add($modal_id = null){
      if (IS_POST) {
            // 业务逻辑
      }
      else {
          $data_list = ["status" => 1];
          $project_info = [
            '41' => 'text1',
            '42' => 'text2',
            '43' => 'text3',
          ];
          $builder = new \Qscmf\Builder\FormBuilder();
          $builder
              ->setPostUrl(U('add'))
              ->addFormItem("project_id", "select2", "所属项目", '',$project_info,"",' style="width: 100%" dropdownParent="#'.$modal_id.'"')
              ->setFormData($data_list)
              ->setShowBtn(false);

          return $builder->display(true);
      }
  }
  ```

#### setCancelText

设置关闭按钮的描述

#### setSubmitText

设置确定按钮的描述

#### setTitle
```text
设置模态框的标题
```
```php
// 参数说明
// string $title 标题
->setTitle("title")
```

#### setBody
```text
设置模态框的内容
```
```php
// 参数说明
// string $html body的html
->setBody("body")

// 可以搭配FormBuilder展示和提交表单
$form_builder_html = '使用FormBuilder生成Html';// 使用FormBuilder构建页面
->setBody($form_builder_html)
```

#### setBodyApiUrl
```text
使用接口设置模态框的内容
(待完善功能)
```
```php
// 参数说明
// string $body_api_url api
->setBodyApiUrl(U('genModalForm'))

// api需要返回 status 和 info 字段
// 成功时status 应为1 info 应为模态框body的html内容
// 失败时status 应为0 info 应为错误提示
public function genModalForm(){
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

        $this->ajaxReturn(['status' => 1, 'info' => $builder->display(true)];
    }
}
```

#### setDialogWidth
```text
自定义模态框宽度
```
```php
// 参数说明
// string $width 宽度
->setDialogWidth("80%")
```

#### setDialogHeight
```text
自定义模态框距离屏幕顶部高度
```
```php
// 参数说明
// string $height 高度
->setDialogHeight("80%")
```

#### setBodyHeight
```text
自定义模态框body高度
```
```php
// 参数说明
// string $height 高度
->setBodyHeight("60vh")
```

#### setIsShowFooter
```text
是否展示模态框footer
```
```php
// 参数说明
// boolean $is_show 默认为true
->setIsShowFooter(false)
```

#### showDefBtn
```text
是否展示默认的关闭、确定按钮
```
```php
// 参数说明
// boolean $show_default_btn 默认为true
->showDefBtn(false)
```

#### setKeyboard
```text
是否可以使用ESC关闭模态框
```
```php
// 参数说明
// boolean $is_close 默认为true
->setKeyboard(false)
```

#### setBackdrop
```text
点击遮罩层是否可以关闭模态框
```
```php
// 参数说明
// boolean $is_close 默认为true
->setBackdrop(false)
```

#### setAjaxSubmit
```text
使用ajax-post提交表单数据，若为false则为form的默认提交
只对默认提交按钮有效
```
```php
// 参数说明
// boolean $ajax_submit 默认为true
->setAjaxSubmit(false)
```

#### setIsForward
```text
提交数据后是否跳转至新页面，false 跳转 true 不跳转，默认为true
```
```php
// 参数说明
// boolean $is_forward 默认为true
->setIsForward(false)
```

#### setIsJump
```text
提交数据后是否跳转至新页面，false 不跳转 true 跳转，默认为false 
```
```php
// 参数说明
// boolean $is_jump 默认为false
->setIsJump($is_jump)
```

#### getGid
```php
// 获取模态框随机码值
// 模态框dom 的id为 idQsButtonModal
->getGid()
```

#### getModalDom
```php
// 获取模态框domId
// 模态框dom 的id为 idQsButtonModal
->getModalDom()
```

#### setSelectedIdName
```text
设置ListBuilder选中checkbox值的字段名，默认为qslb_selected_ids
```
```php
// 参数说明
// string $name 
->setSelectedIdFieldName($name)
```

#### bindFormBuilder
```text
设置 form_builder 属性
```
```php
// 参数说明
// FormBuilder $builder
->bindFormBuilder($builder)
```

#### addPrevButton
```text
添加上一条按钮
```
```php
// 参数说明
// string $href 表单接口
// int|string $current_id 当前记录ID
// string $title 按钮标题
// array $attribute 按钮属性
// string $id_key 主键字段名，默认为'id'

->addPrevButton($href, $current_id, $title, $attribute, $id_key)
```

#### addNextButton
```text
添加上一条按钮
```
```php
// 参数说明
// string $href 表单接口
// int|string $current_id 当前记录ID
// string $title 按钮标题
// array $attribute 按钮属性
// string $id_key 主键字段名，默认为'id'

->addNextButton($href, $current_id, $title, $attribute, $id_key)
```
