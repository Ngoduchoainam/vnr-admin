import { Form, Input, Modal, Select } from "antd"
import { forwardRef, useEffect, useImperativeHandle } from "react"
import { TAgencyField } from "../../../models/agency/agency";
import { SelectType } from "../../../models/common";
import styles from './style.module.scss'
import classNames from "classnames/bind";
import { hasRole, ROLE } from "../../../helper/const";

interface Props {
  role: string | null,
  organizationId: string | null,
  isModalOpen: boolean,
  handleOk: () => void,
  handleCancel: () => void,
  onFinish: (values: TAgencyField) => void,
  editingData?: TAgencyField | null,
  selectSystemData: SelectType[],
  isLoadingBtn?: boolean
}

const AgencyModal = forwardRef<{ submit: () => void; reset: () => void; organizationReset: () => void }, Props>((props, ref) => {
  const {
    role,
    organizationId,
    isModalOpen,
    editingData,
    selectSystemData,
    handleOk,
    handleCancel,
    onFinish,
    isLoadingBtn
  } = props
  const cx = classNames.bind(styles)
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    submit: () => {
      form.submit();
    },
    reset: () => {
      form.resetFields();
    },
    organizationReset: () => {
      form.resetFields(['name', 'description'])
    }
  }));

  useEffect(() => {
    if (editingData) {
      form.setFieldsValue({
        name: editingData?.name,
        description: editingData?.description,
        organizationId: editingData.organization?.id
      });
    }
    else {
      form.resetFields();
      if (!hasRole([ROLE.ADMIN], String(role))) {
        form.setFieldsValue({ organizationId: organizationId });
      }
    }
  }, [editingData, form]);

  return (
    <Modal
      title={editingData ? 'Sửa chi nhánh' : 'Thêm chi nhánh'}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      maskClosable={false}
      centered
      okButtonProps={{ loading: isLoadingBtn }}
    >
      <Form
        form={form}
        name="form"
        onFinish={onFinish}
        autoComplete="off"
        layout="vertical"
      >
        <Form.Item
          label="Chọn hệ thống"
          name="organizationId"
          className={cx("custom-margin-form")}
          rules={[{ required: true, message: 'Không được để trống hệ thống' }]}
        >
          <Select
            allowClear
            showSearch
            placeholder="Chọn hệ thống"
            options={selectSystemData}
            notFoundContent={'Không có dữ liệu'}
            disabled={!hasRole([ROLE.ADMIN], String(role))}
          />
        </Form.Item>
        <Form.Item<TAgencyField>
          label="Tên chi nhánh"
          name="name"
          rules={[{ required: true, whitespace: true, message: 'Không được để trống tên chi nhánh' }]}
          className={cx("custom-margin-form")}
        >
          <Input />
        </Form.Item>

        <Form.Item<TAgencyField>
          label="Ghi chú"
          name="description"
        >
          <Input.TextArea autoSize={{ minRows: 6, maxRows: 10 }} maxLength={249} />
        </Form.Item>
      </Form>
    </Modal>
  )
});

export default AgencyModal;
