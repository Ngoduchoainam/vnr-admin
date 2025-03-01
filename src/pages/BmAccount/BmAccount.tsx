import { FC, useEffect, useRef, useState } from 'react'
import styles from './style.module.scss'
import classNames from 'classnames/bind';
import { Button, message, Select, Space, Table, Tag, Tooltip } from 'antd';
import type { FormProps, TableProps } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import DeleteModal from '../../Components/Modal/DeleteModal/DeleteModal';
import userApi from '../../api/userApi';
import { TBmList, TBmUser, TBmUserField } from '../../models/user/user';
import { SelectType } from '../../models/common';
import { TypeTeamTable } from '../../models/team/team';
import groupApi from '../../api/groupApi';
import branchApi from '../../api/branchApi';
import { TAgencyTable } from '../../models/agency/agency';
import { TSystemTable } from '../../models/system/system';
import organizationApi from '../../api/organizationApi';
import BmAccountModal from '../../Components/Modal/BmAccountModal/BmAccountModal';
import { convertStringToRoundNumber, DEFAULT_PAGE_SIZE, formatNumberWithCommas, hasRole, ROLE } from '../../helper/const';

interface Props {
  role: string | null
  organizationId: string | null
  branchId: string | null
  groupId: string | null
}

const SystemManagement: FC<Props> = (props) => {
  const { role, organizationId, branchId, groupId } = props
  const cx = classNames.bind(styles)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [dataTable, setDataTable] = useState<TBmUser[]>([])
  const [dataRecord, setDataRecord] = useState<TBmUser | null>(null)
  const [loading, setLoading] = useState({
    isTable: false,
    isBtn: false,
    isSelectSystem: false,
    isSelectAgency: false,
    isSelectTeam: false
  })
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalData, setTotalData] = useState<number>(0);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState<boolean>(false)
  const [selectSystemData, setSelectSystemData] = useState<SelectType[]>([])
  const [selectAgencyData, setSelectAgencyData] = useState<SelectType[]>([])
  const [selectTeamData, setSelectTeamData] = useState<SelectType[]>([])
  const [selectTeamId, setSelectTeamId] = useState<string | null>(null)
  const [selectSystemId, setSelectSystemId] = useState<string | null>(null)
  const [selectAgencyId, setSelectAgencyId] = useState<string | null>(null)
  const [isCallbackApi, setIsCallbackApi] = useState<boolean>(false)
  const [messageApi, contextHolder] = message.useMessage();
  const modalRef = useRef<{ submit: () => void; reset: () => void }>(null);

  const columns: TableProps<TBmUser>['columns'] = [
    {
      title: 'Đội nhóm',
      key: 'idBM',
      render: (record) => <span>{record?.group?.name}</span>,
      width: '25%'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: '25%'
    },
    {
      title: 'Danh sách id BM',
      dataIndex: 'pms',
      key: 'pms',
      render: (value) => value.map((item: TBmList) =>
        <Tooltip
          trigger={'hover'}
          title={(
            <>
              <div>Loại tài khoản: {item.typeAccount}</div>
              <div>Nguồn tài khoản: {item.sourceAccount}</div>
              <div>Giá tiền: {formatNumberWithCommas(item.cost)}</div>
              <div>Thông tin đăng nhập: {item.informationLogin}</div>
            </>
          )}
        >
          <Tag>{item?.id}</Tag>
        </Tooltip>
      ),
      width: '25%'
    },
    {
      title: 'Tùy chọn',
      key: 'action',
      width: '15%',
      render: (_, record) => (
        <>
          <Space size="middle">
            <Button icon={<EditOutlined />} type="primary" onClick={() => handleShowModal(record)}>
              Sửa
            </Button>
            <Button icon={<DeleteOutlined />} danger onClick={() => handleShowConfirmDelete(record)}>
              Xóa
            </Button>
          </Space>
        </>
      ),
    },
  ];

  const onFinish: FormProps<TBmUserField>['onFinish'] = (values) => {
    setLoading({ ...loading, isBtn: true })
    if (dataRecord) {
      const data = {
        id: dataRecord?.id,
        email: values.email,
        groupId: values.groupId,
        bms: values.bms.map((item) => ({ ...item, cost: convertStringToRoundNumber(item.cost.toString().replace(/\./g, '')) })),
        chatId: values.chatId,
        tokenTelegram: values.tokenTelegram
      }
      userApi.updateBmUser(data).then(() => {
        setIsModalOpen(false)
        setIsCallbackApi(!isCallbackApi)
        setLoading({ ...loading, isBtn: false })
        success('Sửa tài khoản BM thành công!')
      }).catch((err) => {
        setLoading({ ...loading, isBtn: false })
        error(err.response.data.message)
      })
    }
    else {
      const data = {
        email: values.email,
        groupId: values.groupId,
        bms: values.bms.map((item) => ({ ...item, cost: convertStringToRoundNumber(item.cost.toString().replace(/\./g, '')) })),
        chatId: values.chatId,
        tokenTelegram: values.tokenTelegram
      }
      userApi.createBmUser(data).then(() => {
        setIsModalOpen(false)
        setIsCallbackApi(!isCallbackApi)
        modalRef.current?.reset();
        setLoading({ ...loading, isBtn: false })
        success('Tạo tài khoản BM thành công!')
      }).catch((err) => {
        setLoading({ ...loading, isBtn: false })
        error(err.response.data.message)
      })
    };
  };

  const handleOk = () => {
    if (modalRef.current) {
      modalRef.current.submit();
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    setDataRecord(null)
  }

  const handleShowModal = (data: TBmUser | null = null) => {
    if (data) {
      setDataRecord(data)
      setIsModalOpen(true)
    }
    else {
      setDataRecord(null)
      setIsModalOpen(true)
    }
  }

  const handleShowConfirmDelete = (data: TBmUser) => {
    setDataRecord(data)
    setIsDeleteConfirm(true)
  }

  const handleConfirmDelete = () => {
    setLoading({ ...loading, isBtn: true })
    userApi.deleteUser(dataRecord?.id as string).then(() => {
      setIsCallbackApi(!isCallbackApi)
      setIsDeleteConfirm(false)
      setLoading({ ...loading, isBtn: false })
      success('Xóa tài khoản BM thành công!')
    }).catch((err) => {
      error(err.response.data.message)
      setLoading({ ...loading, isBtn: false })
      setIsDeleteConfirm(false)
    })
  }

  const onChangeSystem = (value: string) => {
    setSelectSystemId(value)
    setSelectAgencyId(null)
    setSelectTeamId(null)
  };

  const onChangeAgency = (value: string) => {
    setSelectAgencyId(value)
    setSelectTeamId(null)
  };

  const onChangeTeam = (value: string) => {
    setSelectTeamId(value)
  };

  const handleCancelDelete = () => {
    setIsDeleteConfirm(false)
  }

  const success = (message: string) => {
    messageApi.open({
      type: 'success',
      content: message,
    });
  };

  const error = (message: string) => {
    messageApi.open({
      type: 'error',
      content: message,
    });
  };

  useEffect(() => {
    setLoading((prevLoading) => ({ ...prevLoading, isSelectSystem: true }))
    setSelectAgencyData([])
    setSelectTeamData([])
    organizationApi.getListOrganization().then((res) => {
      setSelectSystemData(
        res.data.data.map((item: TSystemTable) => ({
          value: item.id,
          label: item.name
        }))
      )
      setLoading((prevLoading) => ({ ...prevLoading, isSelectSystem: false }))
    })
    if (selectSystemId || organizationId) {
      setLoading((prevLoading) => ({ ...prevLoading, isSelectSystem: false, isSelectAgency: true }))
      branchApi.getListBranch({ organizationId: selectSystemId || organizationId || '' }).then((res) => {
        setSelectAgencyData(
          res.data.data.map((item: TAgencyTable) => ({
            value: item.id,
            label: item.name
          }))
        )
        setLoading((prevLoading) => ({ ...prevLoading, isSelectAgency: false }))
      })
    }
    if (selectAgencyId || branchId) {
      setLoading((prevLoading) => ({ ...prevLoading, isSelectAgency: false, isSelectTeam: true }))
      groupApi.getListGroup({ branchId: selectAgencyId || branchId || '' }).then((res) => {
        setSelectTeamData(
          res.data.data.map((item: TypeTeamTable) => ({
            value: item.id,
            label: item.name
          }))
        )
        setLoading((prevLoading) => ({ ...prevLoading, isSelectTeam: false }))
      })
    }
  }, [selectSystemId, selectAgencyId, organizationId, branchId])

  useEffect(() => {
    setLoading({ ...loading, isTable: true })
    userApi.getListBmUser({
      pageIndex: currentPage,
      pageSize: DEFAULT_PAGE_SIZE,
      organizationId: selectSystemId || organizationId || '',
      branchId: selectAgencyId || branchId || '',
      groupId: selectTeamId || groupId || ''
    }).then((res) => {
      const data = res.data.data
      if (data.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }
      else {
        const dataTableConfig = data.map((item: TBmUser) => ({
          ...item,
          key: item.id,
        }));
        setTotalData(res.data.paging.totalCount)
        setDataTable(dataTableConfig)
        setLoading({ ...loading, isTable: false })
      }
    }).catch(() => {
      setLoading({ ...loading, isTable: false })
    })
  }, [currentPage, isCallbackApi, selectSystemId, selectAgencyId, selectTeamId, organizationId, branchId, groupId])

  return (
    <>
      {contextHolder}
      <div>
        <Tooltip title='Thêm tài khoản BM'>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            className={cx('btn')}
            onClick={() => handleShowModal()}
          >
            Thêm tài khoản BM
          </Button>
        </Tooltip>
        <div className={cx("bm-container")}>
          {role && hasRole([ROLE.ADMIN], role) &&
            <Select
              allowClear
              showSearch
              placeholder="Chọn hệ thống"
              optionFilterProp="label"
              onChange={onChangeSystem}
              options={selectSystemData}
              className={cx("select-system-item")}
              notFoundContent={'Không có dữ liệu'}
              loading={loading.isSelectSystem}
            />
          }
          {role && hasRole([ROLE.ADMIN, ROLE.ORGANIZATION], role) &&
            <Select
              allowClear
              showSearch
              placeholder="Chọn chi nhánh"
              optionFilterProp="label"
              onChange={onChangeAgency}
              options={selectAgencyData}
              value={selectAgencyId || null}
              className={cx("select-system-item")}
              notFoundContent={selectSystemId || organizationId ? 'Không có dữ liệu' : 'Bạn cần chọn hệ thống trước'}
              loading={loading.isSelectAgency}
            />
          }
          {role && hasRole([ROLE.ADMIN, ROLE.ORGANIZATION, ROLE.BRANCH], role) &&
            <Select
              allowClear
              showSearch
              placeholder="Chọn đội nhóm"
              optionFilterProp="label"
              onChange={onChangeTeam}
              options={selectTeamData}
              value={selectTeamId || null}
              className={cx("select-system-item")}
              notFoundContent={selectAgencyId || branchId ? 'Không có dữ liệu' : 'Bạn cần chọn chi nhánh trước'}
              loading={loading.isSelectTeam}
            />
          }
        </div>
        <Table
          columns={columns}
          dataSource={dataTable}
          loading={loading.isTable}
          pagination={{
            current: currentPage,
            pageSize: DEFAULT_PAGE_SIZE,
            total: totalData,
            position: ['bottomCenter'],
            onChange: (page) => setCurrentPage(page),
          }}
        />
      </div>
      <BmAccountModal
        role={role}
        organizationId={organizationId}
        branchId={branchId}
        groupId={groupId}
        ref={modalRef}
        isModalOpen={isModalOpen}
        handleOk={handleOk}
        handleCancel={handleCancel}
        onFinish={onFinish}
        editingData={dataRecord}
        selectSystemData={selectSystemData}
        isLoadingBtn={loading.isBtn}
      />
      <DeleteModal
        title='Xóa tài khoản BM'
        open={isDeleteConfirm}
        okText={'Xóa tài khoản BM'}
        cancelText={'Cancel'}
        handleOk={handleConfirmDelete}
        handleCancel={handleCancelDelete}
        description={`Bạn có chắc muốn xóa tài khoản BM ${dataRecord?.email} không?`}
        isLoadingBtn={loading.isBtn}
      />
    </>
  )
}

export default SystemManagement