import GridContent from '@/components/GridContent';
import ConnectState, { ConnectProps } from '@/models/connect';
import {
  CERTIFICATION_STATE,
  CurrentUser,
  SubmitCertificationAction,
  UPLOAD_TYPE,
} from '@/models/user';
import { disabledStyle, formItemLayout, tailFormItemLayout } from '@/utils/form';
import { getBase64, getExt } from '@/utils/upload';
import { Button, Card, Form, Icon, Input, message, Upload } from 'antd';
import { FormComponentProps } from 'antd/es/form/Form';
import { UploadChangeParam } from 'antd/lib/upload';
import { RcFile } from 'antd/lib/upload/interface';
import { connect } from 'dva';
import React from 'react';
import { doFetchUploadSign, doUpload } from '../services';
import style from './index.less';

interface AccountCertificationProps extends ConnectProps, FormComponentProps {
  loading: boolean;
  currentUser: CurrentUser;
}

interface AccountCertificationState {
  license_base64: string;
  license_loading: boolean;
  idcard_front_base64: string;
  idcard_front_loading: boolean;
  idcard_back_base64: string;
  idcard_back_loading: boolean;
}

@connect(({ user, loading }: ConnectState) => ({
  currentUser: user.currentUser,
  loading: loading.models.user,
}))
@Form.create<AccountCertificationProps>()
class AccountCertification extends React.Component<
  AccountCertificationProps,
  AccountCertificationState
> {
  state: AccountCertificationState = {
    license_base64: '',
    license_loading: false,
    idcard_front_base64: '',
    idcard_front_loading: false,
    idcard_back_base64: '',
    idcard_back_loading: false,
  };

  handleSubmit = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (err) return;
      // await Promise
      const { license: t1, idcard_front: t2, idcard_back: t3 } = values.certification;
      const [license, idcard_front, idcard_back] = await Promise.all([t1, t2, t3]);
      // 下面代码应该是无用的
      // if (!license) {
      //   message.error('营业执照图片上传失败，请重新上传。');
      //   return;
      // }
      // if (!idcard_front) {
      //   message.error('身份证正面图片上传失败，请重新上传。');
      //   return;
      // }
      // if (!idcard_back) {
      //   message.error('身份证反面图片上传失败，请重新上传。');
      //   return;
      // }
      // 防御性编程
      delete values.uid;
      delete values.nickname;
      // 传递图片文件名
      values.certification.license = license;
      values.certification.idcard_front = idcard_front;
      values.certification.idcard_back = idcard_back;
      this.props.dispatch!({
        type: 'user/submitCertification',
        payload: values.certification,
      } as SubmitCertificationAction);
    });
  };

  // 检查图片格式和文件大小
  beforeUpload = (file: RcFile, fileList: RcFile[]): boolean => {
    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
      message.error('请上传格式为 jpeg 或 png 的图片。');
      return false;
    }
    if (file.size / 1024 / 1024 > 10) {
      message.error('请上传文件大小小于 10MB 的图片。');
      return false;
    }
    return true;
  };

  // 文件重命名工具函数
  handleRename = (file: File, type: UPLOAD_TYPE) => {
    const ext = getExt(file.name);
    const { uid } = this.props.currentUser;
    const name = `${uid}_${type}.${ext}`;
    return { name, ext };
  };

  // 上传工具函数
  // 获取预签名，直传OSS。
  handleUpload = (type: UPLOAD_TYPE) => async ({
    onSuccess,
    onError,
    file,
  }: {
    onSuccess: (err: any, file: File) => void;
    onError: () => void;
    file: File;
  }) => {
    try {
      // 获取格式化后的文件名和文件后缀
      const { ext, name } = this.handleRename(file, type);
      const url = await doFetchUploadSign({ type, ext });
      // 重命名文件
      const rename = new File([file], name, { type: file.type });
      await doUpload({ url: url!, file: rename });
      onSuccess(null, rename);
    } catch (err) {
      onError();
    }
  };

  // 上传营业执照
  handleLicenseUpload = this.handleUpload(UPLOAD_TYPE.LICENSE);

  // 检验营业执照
  handleLicenseUploadChange = async (info: UploadChangeParam) => {
    if (info.file.status === 'uploading') {
      this.setState({ license_loading: true });
      return;
    }
    if (info.file.status === 'done') {
      const { name } = this.handleRename(info.file.originFileObj!, UPLOAD_TYPE.LICENSE);
      const image = (await getBase64(info.file.originFileObj!)) as string;
      this.setState({ license_base64: image });
      return name;
    }
  };

  // 上传身份证正面
  handleIDCardFrontUpload = this.handleUpload(UPLOAD_TYPE.IDCARD_FRONT);

  // 检验身份证正面
  handleIDCardFrontUploadChange = async (info: UploadChangeParam) => {
    if (info.file.status === 'uploading') {
      this.setState({ idcard_front_loading: true });
      return;
    }
    if (info.file.status === 'done') {
      const { name } = this.handleRename(info.file.originFileObj!, UPLOAD_TYPE.IDCARD_FRONT);
      const image = (await getBase64(info.file.originFileObj!)) as string;
      this.setState({ idcard_front_base64: image, idcard_front_loading: false });
      return name;
    }
  };

  // 上传身份证反面
  handleIDCardBackUpload = this.handleUpload(UPLOAD_TYPE.IDCARD_BACK);

  // 检验身份证反面
  handleIDCardBackUploadChange = async (info: UploadChangeParam) => {
    if (info.file.status === 'uploading') {
      this.setState({ idcard_back_loading: true });
      return;
    }
    if (info.file.status === 'done') {
      const { name } = this.handleRename(info.file.originFileObj!, UPLOAD_TYPE.IDCARD_BACK);
      const image = (await getBase64(info.file.originFileObj!)) as string;
      this.setState({ idcard_back_base64: image });
      return name;
    }
  };

  onRefreshButtonPress = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    this.props.dispatch!({
      type: 'user/refreshCurrentUser',
      callback({ business_certification }: { business_certification: CERTIFICATION_STATE }) {
        if (business_certification === CERTIFICATION_STATE.LOADING) {
          message.info('请耐心等待资质审核结果。');
        }
        if (business_certification === CERTIFICATION_STATE.SUCCESS) {
          message.success('恭喜您，资质审核通过。');
        }
        if (business_certification === CERTIFICATION_STATE.FAILURE) {
          message.error('很抱歉，您提交的资质未被审核通过，请重新提交商户审核资料。');
        }
      },
    });
  };

  render() {
    const {
      license_base64,
      license_loading,
      idcard_front_base64,
      idcard_front_loading,
      idcard_back_base64,
      idcard_back_loading,
    } = this.state;
    const { form, loading, currentUser } = this.props;
    const { getFieldDecorator } = form;
    return (
      <GridContent>
        {currentUser.business_certification === CERTIFICATION_STATE.SUCCESS ? (
          <div>恭喜您，资质审核通过。</div>
        ) : currentUser.business_certification === CERTIFICATION_STATE.LOADING ? (
          <div>
            <div className={style.button_contain}>
              <Button
                type="primary"
                style={{ marginRight: 20 }}
                onClick={this.onRefreshButtonPress}
              >
                <Icon type="reload" />
                刷新
              </Button>
            </div>
            <br />
            <br />
            <div>资质正在审核当中，请等待资质审核结果</div>
          </div>
        ) : (
          <Card bordered={false} style={{ marginTop: 24 }} loading={loading}>
            <Form {...formItemLayout} onSubmit={this.handleSubmit}>
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
                  rules: [{ required: true, message: '请填写用户真实姓名' }],
                })(<Input placeholder="用户真实姓名" style={disabledStyle} />)}
              </Form.Item>
              <Form.Item label="身份证号">
                {getFieldDecorator('certification.idcard_no', {
                  rules: [{ required: true, message: '请填写身份证号' }],
                })(<Input placeholder="身份证号" style={disabledStyle} />)}
              </Form.Item>
              <Form.Item label="公司名称">
                {getFieldDecorator('certification.company', {})(
                  <Input placeholder="公司名称" style={disabledStyle} />,
                )}
              </Form.Item>
              <Form.Item
                label="营业执照注册号"
                help="如果您是公司或组织机构，请填写统一社会信用代码，可加快审核进度"
              >
                {getFieldDecorator('certification.license_no', {})(
                  <Input placeholder="营业执照注册号" style={disabledStyle} />,
                )}
              </Form.Item>
              <Form.Item label="联系微信">
                {getFieldDecorator('certification.wechat', {
                  rules: [{ required: true, message: '请填写联系微信' }],
                })(<Input placeholder="联系微信" style={disabledStyle} />)}
              </Form.Item>
              <Form.Item label="联系电话">
                {getFieldDecorator('certification.phone', {
                  rules: [{ required: true, message: '请填写联系电话' }],
                })(<Input placeholder="联系电话" style={disabledStyle} />)}
              </Form.Item>
              <Form.Item label="联系邮箱">
                {getFieldDecorator('certification.email', {
                  rules: [{ required: true, message: '请填写联系邮箱' }],
                })(<Input placeholder="联系邮箱" style={disabledStyle} />)}
              </Form.Item>
              <Form.Item
                label="营业执照"
                required={false}
                help="如果您是公司或组织机构，请提交营业执照图片，可加快审核进度"
              >
                {getFieldDecorator('certification.license', {
                  getValueFromEvent: this.handleLicenseUploadChange,
                })(
                  <Upload
                    name="license"
                    listType="picture-card"
                    className={style.license_idcard_uploader}
                    beforeUpload={this.beforeUpload}
                    multiple={false}
                    showUploadList={false}
                    customRequest={this.handleLicenseUpload}
                  >
                    {license_base64 ? (
                      <img src={license_base64} className={style.preview} />
                    ) : (
                      <div>
                        <Icon type={license_loading ? 'loading' : 'plus'} />
                        <div className="ant-upload-text">营业执照</div>
                      </div>
                    )}
                  </Upload>,
                )}
              </Form.Item>
              <Form.Item label="身份证正面" required={true}>
                {getFieldDecorator('certification.idcard_front', {
                  rules: [{ required: true, message: '请上传身份证正面图片' }],
                  getValueFromEvent: this.handleIDCardFrontUploadChange,
                })(
                  <Upload
                    name="idcard_front"
                    listType="picture-card"
                    className={style.license_idcard_uploader}
                    beforeUpload={this.beforeUpload}
                    multiple={false}
                    showUploadList={false}
                    customRequest={this.handleIDCardFrontUpload}
                  >
                    {idcard_front_base64 ? (
                      <img src={idcard_front_base64} className={style.preview} />
                    ) : (
                      <div>
                        <Icon type={idcard_front_loading ? 'loading' : 'plus'} />
                        <div className="ant-upload-text">身份证正面</div>
                      </div>
                    )}
                  </Upload>,
                )}
              </Form.Item>
              <Form.Item label="身份证反面" required={true}>
                {getFieldDecorator('certification.idcard_back', {
                  rules: [{ required: true, message: '请上传身份证反面图片' }],
                  getValueFromEvent: this.handleIDCardBackUploadChange,
                })(
                  <Upload
                    name="idcard_back"
                    listType="picture-card"
                    className={style.license_idcard_uploader}
                    beforeUpload={this.beforeUpload}
                    multiple={false}
                    showUploadList={false}
                    customRequest={this.handleIDCardBackUpload}
                  >
                    {idcard_back_base64 ? (
                      <img src={idcard_back_base64} className={style.preview} />
                    ) : (
                      <div>
                        <Icon type={idcard_back_loading ? 'loading' : 'plus'} />
                        <div className="ant-upload-text">身份证反面</div>
                      </div>
                    )}
                  </Upload>,
                )}
              </Form.Item>
              <Form.Item {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit">
                  提交审核
                </Button>
              </Form.Item>
            </Form>
          </Card>
        )}
      </GridContent>
    );
  }
}

export default AccountCertification;
