import GridContent from '@/components/GridContent';
import ConnectState, { ConnectProps } from '@/models/connect';
import { CERTIFICATION_STATE, CurrentUser } from '@/models/user';
import { disabledStyle, formItemLayout, tailFormItemLayout } from '@/utils/form';
import { Button, Card, Form, Icon, Input, Select } from 'antd';
import { FormComponentProps } from 'antd/es/form/Form';
import { connect } from 'dva';
import React from 'react';
import { router } from 'umi';
import style from './index.less';

const { Option } = Select;

interface AccountCenterProps extends ConnectProps, FormComponentProps {
  loading: boolean;
  currentUser: CurrentUser;
}

interface AccountCenterState {
  isEdit: boolean;
}

@connect(({ user, loading }: ConnectState) => ({
  currentUser: user.currentUser,
  loading: loading.models.user,
}))
@Form.create<AccountCenterProps>()
class AccountCenter extends React.Component<AccountCenterProps, AccountCenterState> {
  state: AccountCenterState = {
    isEdit: false,
  };

  /**
   * 进入编辑模式
   */
  onEditModeButtonPress = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    this.setState({ isEdit: true });
  };

  /**
   * 退出编辑模式
   */
  onExitEditModeButtonPress = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    this.setState({ isEdit: false });
    // 重置表单
    this.props.form.resetFields();
  };

  /**
   * 确认编辑
   */
  onConfirmEditButtonPress = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      this.setState({ isEdit: false });
    });
  };

  /**
   * 跳转至商户资料提交页面
   */
  onShouldSubmitCertificationButtonPress = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    router.replace('/account/certification');
  };

  /**
   * 当商户审核状态为默认或失败时，提示用户需提交审核资料
   */
  renderSubmitCertification = (message: string, btn?: string) => {
    return (
      <div>
        {`${message}`}
        <br />
        <br />
        <Button onClick={this.onShouldSubmitCertificationButtonPress}>
          {btn ? btn : '提交商户审核资料'}
        </Button>
      </div>
    );
  };

  render() {
    const { form, loading, currentUser } = this.props;
    const { isEdit } = this.state;
    const { getFieldDecorator } = form;
    const { business_certification } = currentUser;
    return (
      <GridContent>
        {business_certification === CERTIFICATION_STATE.LOADING ? (
          <div>资质正在审核当中，请等待资质审核结果</div>
        ) : business_certification === CERTIFICATION_STATE.DEFAULT ? (
          this.renderSubmitCertification('您未提交任何商户资质审核资料，请提交商户审核资料。')
        ) : business_certification === CERTIFICATION_STATE.FAILURE ? (
          this.renderSubmitCertification(
            '很抱歉，您提交的资质未被审核通过，请重新提交商户审核资料。',
            '重新提交商户审核资料',
          )
        ) : (
          <>
            <div className={style.button_contain}>
              <Button
                type="primary"
                onClick={this.onEditModeButtonPress}
                disabled={isEdit || loading}
                style={{ marginRight: 20 }}
              >
                <Icon type="edit" />
                编辑
              </Button>
            </div>
            <Card bordered={false} style={{ marginTop: 24 }} loading={loading}>
              <Form {...formItemLayout} onSubmit={this.onConfirmEditButtonPress}>
                <Form.Item label="用户ID">
                  {getFieldDecorator('uid', {
                    initialValue: currentUser.uid,
                  })(<Input disabled={true} style={disabledStyle} />)}
                </Form.Item>
                <Form.Item label="用户昵称">
                  {getFieldDecorator('nickname', {
                    initialValue: currentUser.nickname,
                  })(<Input disabled={true} style={disabledStyle} />)}
                </Form.Item>
                <Form.Item label="用户姓名">
                  {getFieldDecorator('certification.name', {
                    initialValue: currentUser.certification!.name,
                  })(<Input disabled={true} style={disabledStyle} />)}
                </Form.Item>
                <Form.Item label="身份证号">
                  {getFieldDecorator('certification.idcard_no', {
                    initialValue: currentUser.certification!.idcard_no,
                  })(<Input disabled={true} style={disabledStyle} />)}
                </Form.Item>
                <Form.Item label="公司名称">
                  {getFieldDecorator('certification.company', {
                    initialValue: currentUser.certification!.company,
                  })(<Input disabled={true} style={disabledStyle} />)}
                </Form.Item>
                <Form.Item label="营业执照注册号">
                  {getFieldDecorator('certification.license_no', {
                    initialValue: currentUser.certification!.license_no,
                  })(<Input disabled={true} style={disabledStyle} />)}
                </Form.Item>
                <Form.Item label="联系微信">
                  {getFieldDecorator('certification.wechat', {
                    initialValue: currentUser.certification!.wechat,
                    rules: [{ required: true, message: '请填写联系微信' }],
                  })(<Input placeholder="联系微信" disabled={!isEdit} style={disabledStyle} />)}
                </Form.Item>
                <Form.Item label="联系电话">
                  {getFieldDecorator('certification.phone', {
                    initialValue: currentUser.certification!.phone,
                    rules: [{ required: true, message: '请填写联系电话' }],
                  })(<Input placeholder="联系电话" disabled={!isEdit} style={disabledStyle} />)}
                </Form.Item>
                <Form.Item label="联系邮箱">
                  {getFieldDecorator('certification.email', {
                    initialValue: currentUser.certification!.email,
                    rules: [{ required: true, message: '请填写联系邮箱' }],
                  })(<Input placeholder="联系邮箱" disabled={!isEdit} style={disabledStyle} />)}
                </Form.Item>
                {isEdit && (
                  <Form.Item {...tailFormItemLayout}>
                    <Button type="primary" htmlType="submit" style={{ marginRight: 20 }}>
                      确认编辑
                    </Button>
                    <Button type="ghost" onClick={this.onExitEditModeButtonPress}>
                      取消编辑
                    </Button>
                  </Form.Item>
                )}
              </Form>
            </Card>
          </>
        )}
      </GridContent>
    );
  }
}

export default AccountCenter;
