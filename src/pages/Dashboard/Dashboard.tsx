import classNames from 'classnames/bind';
import ReactECharts from 'echarts-for-react';
import styles from './style.module.scss'
import { DatePicker, Spin } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { convertStringToRoundNumber, formatDateYMD } from '../../helper/const';
import { useEffect, useState } from 'react';
import { TBarChartData } from '../../models/statistic/statistic';
import axios from 'axios';
import statisticApi from '../../api/statisticApi';

const Dashboard = () => {
  const cx = classNames.bind(styles);
  const [totalAmountSpentData, setTotalAmountSpentData] = useState<TBarChartData>({ x: [], y: [] })
  const [highestEmployeeResultData, setHighestEmployeeResultData] = useState<TBarChartData>({ x: [], y: [] })
  const [totalCostPerResultData, setTotalCostPerResultData] = useState<TBarChartData>({ x: [], y: [] })
  const [totalResultCampaignData, setTotalResultCampaignData] = useState<TBarChartData>({ x: [], y: [] })
  const [totalCostOfMaterialsData, setTotalCostOfMaterialsData] = useState<TBarChartData>({ x: [], y: [] })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [totalAmountSpentChart, setTotalAmountSpentChart] = useState<any>({})
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [highestEmployeeResultChart, setHighestEmployeeResultChart] = useState<any>({})
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [totalCostPerResultChart, setTotalCostPerResultChart] = useState<any>({})
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [totalResultCampaignChart, setTotalResultCampaignChart] = useState<any>({})
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [totalCostOfMaterialsChart, setTotalCostOfMaterialsChart] = useState<any>({})
  const [loading, setLoading] = useState({
    isPieChart: false
  })
  const { RangePicker } = DatePicker;
  const currentDate = new Date();
  const yesterday = new Date(currentDate);
  yesterday.setDate(currentDate.getDate() - 1);
  const [startTime, setStartTime] = useState<string>(formatDateYMD(yesterday))
  const [endTime, setEndTime] = useState<string>(formatDateYMD(yesterday))
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs(yesterday),
    dayjs(yesterday),
  ]);



  const handleRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates !== null) {
      setDateRange(dates);
      if (dates[0] !== null && dates[1] !== null) {
        const startTime = formatDateYMD(dates[0].toDate());
        const endTime = formatDateYMD(dates[1].toDate());
        setStartTime(startTime);
        setEndTime(endTime);
      }
    }
  };

  useEffect(() => {
    setLoading((prevLoading) => ({ ...prevLoading, isPieChart: true }))
    axios.all([
      statisticApi.getTotalAmountSpent({
        start: `${startTime}T01:00:00`,
        end: `${endTime}T23:59:59`,
      }),
      statisticApi.getHighestResultEmployee({
        start: `${startTime}T01:00:00`,
        end: `${endTime}T23:59:59`,
      }),
      statisticApi.getTotalCostPerResult({
        start: `${startTime}T01:00:00`,
        end: `${endTime}T23:59:59`,
      }),
      statisticApi.getTotalResultCampaign({
        start: `${startTime}T01:00:00`,
        end: `${endTime}T23:59:59`,
      }),
      statisticApi.getTotalCostMaterial({
        start: `${startTime}T01:00:00`,
        end: `${endTime}T23:59:59`,
      })
    ]).then(axios.spread((totalAmountSpentRes, highestEmployeeResultRes, totalCostPerResultRest, totalResultCampaignRes, totalCostMaterialRes) => {
      setTotalAmountSpentData(totalAmountSpentRes.data.data.data)
      setHighestEmployeeResultData(highestEmployeeResultRes.data.data.data)
      setTotalCostPerResultData(totalCostPerResultRest.data.data)
      setTotalResultCampaignData(totalResultCampaignRes.data.data.data)
      setTotalCostOfMaterialsData(totalCostMaterialRes.data.data)
      setLoading((prevLoading) => ({ ...prevLoading, isPieChart: false }))
    })).catch(() => setLoading((prevLoading) => ({ ...prevLoading, isPieChart: false })))
  }, [startTime, endTime])

  useEffect(() => {
    if (totalAmountSpentData) {
      setTotalAmountSpentChart({
        title: {
          text: 'Thống kê tổng tiền chi tiêu cho Facebook cá nhân',
          left: 'center',
          textStyle: {
            fontFamily: 'sans-serif'
          }
        },
        tooltip: {
          trigger: 'item',
          textStyle: {
            fontFamily: 'sans-serif'
          }
        },
        series: [
          {
            name: 'VND',
            type: 'pie',
            radius: '50%',
            label: {
              fontFamily: 'sans-serif'
            },
            data: totalAmountSpentData.x.map((item, index) => ({
              value: convertStringToRoundNumber(totalAmountSpentData.y[index]),
              name: item,
            })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      })
    }
    if (highestEmployeeResultData) {
      setHighestEmployeeResultChart({
        title: {
          text: 'Thống kê kết quả tin nhắn',
          left: 'center',
          textStyle: {
            fontFamily: 'sans-serif'
          }
        },
        tooltip: {
          trigger: 'item',
          textStyle: {
            fontFamily: 'sans-serif'
          }
        },
        series: [
          {
            name: 'Kết quả',
            type: 'pie',
            radius: '50%',
            label: {
              fontFamily: 'sans-serif'
            },
            data: highestEmployeeResultData.x.map((item, index) => ({
              value: convertStringToRoundNumber(highestEmployeeResultData.y[index]),
              name: item,
            })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      })
    }
    if (totalCostPerResultData) {
      setTotalCostPerResultChart({
        title: {
          text: 'Thống kê chi phí / kết quả',
          left: 'center',
          textStyle: {
            fontFamily: 'sans-serif'
          }
        },
        tooltip: {
          trigger: 'item',
          textStyle: {
            fontFamily: 'sans-serif'
          }
        },
        series: [
          {
            name: 'VND',
            type: 'pie',
            radius: '50%',
            label: {
              fontFamily: 'sans-serif'
            },
            data: totalCostPerResultData.x.map((item, index) => ({
              value: convertStringToRoundNumber(totalCostPerResultData.y[index]),
              name: item,
            })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              }
            },
          }
        ]
      })
    }
    if (totalResultCampaignData) {
      setTotalResultCampaignChart({
        title: {
          text: 'Thống kê tổng số lượng chiến dịch',
          left: 'center',
          textStyle: {
            fontFamily: 'sans-serif'
          }
        },
        tooltip: {
          trigger: 'item',
          textStyle: {
            fontFamily: 'sans-serif'
          }
        },
        series: [
          {
            name: 'Chiến dịch',
            type: 'pie',
            radius: '50%',
            label: {
              fontFamily: 'sans-serif'
            },
            data: totalResultCampaignData.x.map((item, index) => ({
              value: convertStringToRoundNumber(totalResultCampaignData.y[index]),
              name: item,
            })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      })
    }
    if (totalCostOfMaterialsData) {
      setTotalCostOfMaterialsChart({
        title: {
          text: 'Thống kê tổng số tiền mua nguyên liệu',
          left: 'center',
          textStyle: {
            fontFamily: 'sans-serif'
          }
        },
        tooltip: {
          trigger: 'item',
          textStyle: {
            fontFamily: 'sans-serif'
          }
        },
        series: [
          {
            name: 'VND',
            type: 'pie',
            radius: '50%',
            label: {
              fontFamily: 'sans-serif'
            },
            data: totalCostOfMaterialsData.x.map((item, index) => ({
              value: convertStringToRoundNumber(totalCostOfMaterialsData.y[index]),
              name: item,
            })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      })
    }
  }, [highestEmployeeResultData, totalAmountSpentData, totalCostPerResultData, totalResultCampaignData, totalCostOfMaterialsData])

  return (
    <>
      <div className={cx('range-container')}>
        <RangePicker
          allowClear={false}
          format={"DD-MM-YYYY"}
          onChange={(dates) => handleRangeChange(dates)}
          placeholder={["Bắt đầu", "Kết thúc"]}
          value={dateRange}
          maxDate={dayjs()}
          className={cx('select-range')}
        />
      </div>
      <div className={cx('container')}>
        <div className={cx('item')}>
          <ReactECharts
            option={totalAmountSpentChart}
            style={{ height: '100%', width: '100%' }}
          />
        </div>
        <div className={cx('item')}>
          <ReactECharts
            option={highestEmployeeResultChart}
            style={{ height: '100%', width: '100%' }}
          />
        </div>
        <div className={cx('item')}>
          <ReactECharts
            option={totalCostPerResultChart}
            style={{ height: '100%', width: '100%' }}
          />
        </div>
        <div className={cx('item')}>
          <ReactECharts
            option={totalResultCampaignChart}
            style={{ height: '100%', width: '100%' }}
          />
        </div>
        <div className={cx('item')}>
          <ReactECharts
            option={totalCostOfMaterialsChart}
            style={{ height: '100%', width: '100%' }}
          />
        </div>
      </div>
      <Spin spinning={loading.isPieChart} fullscreen />
    </>
  )
}

export default Dashboard