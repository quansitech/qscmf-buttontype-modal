<?php
namespace Qs\ModalButton;

use Illuminate\Support\Str;
use Qscmf\Builder\FormBuilder;

class ModalButtonBuilder
{
    protected $gid;
    protected $header_title;
    protected $show_header = true;
    protected $body_html;
    protected $show_footer = true;
    protected $footer_button = [];
    protected $modal_html = '';
    protected $dialog_width = null;
    protected $dialog_height = null;
    protected $body_height = null;
    protected $show_default_btn = true;
    protected $keyboard = true;
    protected $backdrop = true;
    protected $ajax_submit = true;
    protected $is_forward = true;
    protected $body_api_url = null;
    protected $modal_dom = "";
    protected string $inject_selected_id_class = "inject_selected";
    protected string $selected_id_field_name = 'qslb_selected_ids';
    protected bool $is_jump = false;
    protected FormBuilder $form_builder;
    protected string $def_submit_btn_id = '';
    protected string $cancel_text = '关闭';
    protected string $submit_text = "确定";

    public function __construct()
    {
        $this->setGid();
        $this->setModalDom();
    }

    public function setCancelText(string $text){
        $this->cancel_text = $text;
        return $this;
    }

    public function setSubmitText(string $text){
        $this->submit_text = $text;
        return $this;
    }


    protected function addDefButton(){
        $this->addFooterButton($this->cancel_text, ['type' => 'button', 'class' => 'btn btn-secondary closeModal', 'data-dismiss' => 'modal']);
        $this->addDefSubmitButton();
    }

    protected function setDefSubmitBtnId():void{
        $this->def_submit_btn_id = Str::uuid()->getHex();
    }

    protected function addDefSubmitButton(){
        $this->setDefSubmitBtnId();
        $submit_cls = 'btn btn-primary submitModal '.$this->def_submit_btn_id;
        $this->ajax_submit && $submit_cls .=' ajax-post ';
        !$this->isJump() && $submit_cls .= ' no-refresh no-forward ';

        $this->addFooterButton($this->submit_text, ['type' => 'submit', 'class' => $submit_cls,'target-form' => $this->getGid().'-builder-form']);
    }

    protected function isJump(){
        if ($this->is_jump === true){
            return true;
        }
        if ($this->is_forward === false){
            return true;
        }

        return false;
    }

    protected function setGid(){
        $this->gid = Str::uuid()->getHex();
    }

    /**
     * @deprecated 在v2版本删除， 请使用 setIsJump 代替
     * 提交数据后是否跳转至新页面，false 跳转 true 不跳转，默认为true
     */
    public function setIsForward($is_forward){
        $this->is_forward = $is_forward;
        return $this;
    }

    public function setIsJump($is_jump){
        $this->is_jump = $is_jump;
        return $this;
    }

    public function getGid(){
        return $this->gid;
    }

    public function setTitle($title){
        $this->header_title = $title;
        return $this;
    }

    public function setBody($html){
        $this->body_html = $html;
        return $this;
    }

    public function setIsShowFooter($is_show){
        $this->show_footer = $is_show === true;
        return $this;
    }

    public function addFooterButton($title, $attribute){
        $attribute['type'] = $attribute['type'] ?: 'button';
        $button = ['title' => $title, 'attribute' => $attribute];
        array_push($this->footer_button, $button);
        return $this;
    }

    /**
     * 添加上一条按钮
     * @param string $title 按钮标题
     * @param array $attribute 按钮属性
     * @param mixed $current_id 当前记录ID
     * @param string $id_key 主键字段名，默认为'id'
     * @return $this
     */
    public function addPrevButton($title, $attribute, $current_id = null, $id_key = 'id'){
        if (!isset($attribute['class'])) {
            $attribute['class'] = '';
        }
        $attribute['class'] .= ' qscmf_modal_nav_btn qscmf_modal_nav_prev_btn';
        $attribute['data-current-id'] = $current_id;
        $attribute['data-id-key'] = $id_key;
        $attribute['data-operate-type'] = 'prev';
        return $this->addFooterButton($title, $attribute);
    }

    /**
     * 添加下一条按钮
     * @param string $title 按钮标题
     * @param array $attribute 按钮属性
     * @param mixed $current_id 当前记录ID
     * @param string $id_key 主键字段名，默认为'id'
     * @return $this
     */
    public function addNextButton($title, $attribute, $current_id = null, $id_key = 'id'){
        if (!isset($attribute['class'])) {
            $attribute['class'] = '';
        }
        $attribute['class'] .= ' qscmf_modal_nav_btn qscmf_modal_nav_next_btn';
        $attribute['data-current-id'] = $current_id;
        $attribute['data-id-key'] = $id_key;
        $attribute['data-operate-type'] = 'next';
        return $this->addFooterButton($title, $attribute);
    }

    protected function compileHtmlAttr($attr) {
        $result = array();
        foreach ($attr as $key => $value) {
            if(!empty($value) && !is_array($value)){
                $value = htmlspecialchars($value);
                $result[] = "$key=\"$value\"";
            }
        }
        $result = implode(' ', $result);
        return $result;
    }

    public function showDefBtn($is_show){
        $this->show_default_btn = $is_show;
        return $this;
    }

    public function setKeyboard($is_close){
        $this->keyboard = $is_close;
        return $this;
    }
    public function setBackdrop($is_close){
        $type = $is_close === false ? 'static' : true;
        $this->backdrop = $type;
        return $this;
    }

    public function setDialogWidth($width){
        $this->dialog_width = $width;
        return $this;
    }

    public function setDialogHeight($height){
        $this->dialog_height = $height;
        return $this;
    }

    public function setBodyHeight($height){
        $this->body_height = $height;
        return $this;
    }

    public function setAjaxSubmit($ajax_submit){
        $this->ajax_submit = $ajax_submit;
        return $this;
    }

    // todo 待完善功能
    public function setBodyApiUrl($body_api_url){
        $this->body_api_url = $body_api_url;
        return $this;
    }

    protected function setModalDom(){
        $this->modal_dom = $this->getGid()."QsButtonModal";
        return $this;
    }

    public function getModalDom(){
        return $this->modal_dom;
    }

    public function setSelectedIdFieldName($name){
        $this->selected_id_field_name = $name;
        return $this;
    }

    public function bindFormBuilder(FormBuilder $builder):self{
        $this->form_builder = $builder;
        return $this;
    }

    protected function buildForm():string{
        $this->form_builder->setGid($this->getGid());

        return $this->form_builder->build(true);
    }

    public function __toString(){
        if (!empty($this->form_builder) && empty($this->body_html)){
            $this->body_html = $this->buildForm();
        }

        $this->show_footer && $this->show_default_btn && $this->addDefButton();

        if ($this->footer_button) {
            foreach ($this->footer_button as &$button) {
                $button['attribute'] = $this->compileHtmlAttr($button['attribute']);
            }
        }
        
        if (!$this->modal_html){
            $view = new \Think\View();
            $view->assign('gid', $this->gid);
            $view->assign('header_title', $this->header_title);
            $view->assign('body_html', $this->body_html);
            $view->assign('show_footer', $this->show_footer);
            $view->assign('show_header', $this->show_header);
            $view->assign('footer_button', $this->footer_button);
            $view->assign('keyboard', $this->keyboard);
            $view->assign('backdrop', $this->backdrop);
            $view->assign('dialog_width', $this->dialog_width);
            $view->assign('dialog_height', $this->dialog_height);
            $view->assign('body_height', $this->body_height);
            $view->assign('body_api_url', $this->body_api_url);
            $view->assign('modal_dom', $this->modal_dom);
            $view->assign('inject_selected_id_class', $this->inject_selected_id_class);
            $view->assign('selected_id_field_name', $this->selected_id_field_name);
            $view->assign('ajax_submit', $this->ajax_submit);
            $view->assign('def_submit_btn_id', $this->def_submit_btn_id);

            $this->modal_html = $view->fetch(__DIR__ . '/modal.html');
        }

        return $this->modal_html;
    }
}
