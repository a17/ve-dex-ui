import React, { useCallback, useMemo, useState } from 'react';
import { styled } from '@mui/styles';
import { Slider } from '@mui/material';
import BigNumber from 'bignumber.js';
import numeral from 'numeral';

export default function ThreePointSlider({
                                           pointUsed,
                                           pointCurrent,
                                           step = 1,
                                           pointMinPct = 0,
                                           pointMaxPct = 100,
                                           pointMinValue = 0,
                                           pointMaxValue = 100,
                                           appTheme = 'dark',
                                           disabled = false,
                                           valueLabelDisplay = 'on',
                                           onChange,
                                           fixedCallback
                                         }) {
  const trackBackground = 'rgba(129, 145, 185, 0.28)';//#8191B9';
  const railBorder = '1px solid rgba(104, 114, 122, 0.4';
  const trackUsed = '#9A9FAF';
  const trackActive = '#6575B1';

  const [ sliderValue, setSliderValue ] = useState(pointCurrent);

  const countValue = (value, max = pointMaxValue, min = pointMinValue, maxPct = pointMaxPct, minPct = pointMinPct) => {
    return (+value - minPct) * (max - min) / (maxPct - minPct);
  };

  const formatValue = useCallback((value) => {
    return value > 1 ? numeral(BigNumber(value).toLocaleString()).format(value > 1000 ? '(0a)' : '0.00') : fixedCallback(value);
  }, []);

  const onSliderChange = (event, value) => {
    if ( value < pointUsed ) {
      setSliderValue(pointUsed);
      onChange({ currentPct: pointUsed, currentAmount:  countValue(pointUsed)});
      return;
    }
    setSliderValue(value);
    onChange({ currentPct: value, currentAmount:  countValue(value)});
  };

  const labelRender = (value) => {
    return <>
      <div className="item itemPct">{formatValue(value)}%</div>
      <div className="item itemValue">{formatValue(countValue(value))}</div>
    </>
  }

  const markLabelRender = (pct, value) => {
    return <>
      <div className='item itemPct'>{formatValue(pct)}%</div>
      {(!!value || value === 0) && <div className='item itemValue'>{formatValue(value)}</div>}
    </>
  }

  const sliderMarks = useMemo(() => {
    const marks = [ // The sequence of marks is important
      {
        value: pointMinPct,
        label: markLabelRender(pointMinPct, pointMinValue),
      },
      {
        value: pointMaxPct,
        label: markLabelRender(pointMaxPct, pointMaxValue),
      }
    ];
    // console.log('pointUsed',pointUsed)
    // console.log('pointMinPct',pointMinPct)
    if (BigNumber(pointUsed).gt(0) && pointMinPct !== pointUsed && pointMaxPct !== pointUsed && BigNumber(pointUsed).minus(BigNumber(pointUsed).div(100)).gt(BigNumber(pointMinPct)) ) {
      marks.push({
        value: pointUsed,
        label: labelRender(pointUsed)
      });
    }
    return marks;
  }, [ pointUsed, pointCurrent, pointMinPct, pointMaxPct, pointMinValue, pointMaxValue ]);


  const StyledSlider = useMemo(() => {

    return styled(Slider)(({ disabled, appTheme, value }) => {
      const countPct = (value, min = pointMinPct, max = pointMaxPct) => {
        return 100 - 100 * (max - value) / (max - min);
      };
      const trackColor = `linear-gradient(to right, ${trackUsed} ${countPct(pointUsed)}%, ${trackActive} ${countPct(pointUsed)}%, ${trackActive} ${countPct(value)}%, ${trackBackground} ${countPct(value)}%)`;

      const MuiSliderThumb = {
        backgroundColor: '#B1F1E3'
      }

      const MuiSliderTrack = {
        backgroundColor: trackBackground,
      }

      const MuiSliderRail = {
        background: 'transprent',
        border: railBorder,
      }

      const MultiSliderMark = {
        color: '#8191B9'
      }

      if ( disabled ) {
        MuiSliderThumb.backgroundColor = appTheme === 'dark' ? '#7F828B' : '#A3A9BA';
        MuiSliderTrack.backgroundColor = '#D4D5DB';
        MuiSliderRail.background = 'rgb(210 210 210)';
      }

      return ({
        color: 'transparent',
        height: 8,
        padding: '8px 0',
        '& .MuiSlider-thumb': {
          borderRadius: 12,
          height: 20,
          width: 20,
          backgroundColor: MuiSliderThumb.backgroundColor,
          boxShadow: 'none',
          '&:focus, &:hover, &.Mui-active': {
            boxShadow: 'none',
            '@media (hover: none)': {
              boxShadow: 'none',
            },
          },
        },
        '& .MuiSlider-valueLabel': {
          background: 'transparent',
          padding: 0,
          top: '13px',
          bottom: 0,

          '& .MuiSlider-valueLabelLabel': {
            marginTop: 2,
            height: 78,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            textTransform: 'uppercase',
            '@media (max-width: 860px)': {
              height: 58,
              marginTop: 0,
            },
            '& .item': {
              fontFamily: 'BalooBhai2',
              fontSize: '14px',
              lineHeight: '14px',
              fontWeight: 500,

              color: '#B1F1E3',
              // borderRadius: '4px',
              // padding: '4px 8px',
              whiteSpace: 'nowrap',
              textAlign: 'center',
              width: 'fit-content',
              '&:first-of-type': {
                // marginBottom: '20px'
              },
              // '@media (max-width: 860px)': {
              //   fontSize: '12px',
              //   lineHeight: '12px',
              //   padding: '4px 8px',
              // },
            },
          },
          '&:before': {
            display: 'none'
          }
        },
        '& .MuiSlider-track': {
          border: 'none',
          // backgroundColor: MuiSliderTrack.backgroundColor,
          opacity: 1,
          backgroundColor: '#6575B1',
        },
        '& .MuiSlider-rail': {
          color: 'rgba(104, 114, 122, 0.4)',
          opacity: 1,
          background: MuiSliderRail.background,
          border: MuiSliderRail.border,
          backgroundColor: 'red',
        },
        '& .MuiSlider-mark': {
          display: 'none'
        },
        '& .MuiSlider-markLabel': {
          color: MultiSliderMark.color,
          textTransform: 'uppercase',
          fontSize: '14px',
          lineHeight: '20px',
          fontWeight: 500,
          top: '-26px',
          '@media (max-width: 860px)': {
            top: -18,
          },
          '&:nth-of-type(4)': {
            transform: 'translateX(0%)'
          },
          '&:nth-of-type(6)': {
            transform: 'translateX(-100%)',
            textAlign: 'right'
          },
          '&:nth-of-type(8)': {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center'
          },
          '& .item': {
            fontFamily: 'BalooBhai2',
            fontSize: 14,
            fontWeight: 500,
            lineHeight: '14px',
            color: '#68727A',
            // background: '#060B17',
            // padding: '0 8px',
            '&:first-of-type': {
              marginBottom: '50px'
            },
            '@media (max-width: 860px)': {
              '&:first-of-type': {
                marginBottom: '30px'
              }
            }
          },
          // '@media (max-width: 860px)': {
          //   fontSize: '12px',
          //   lineHeight: '12px',
          //   top: '-9px',
          // },
        },
      });
    })
  }, [ pointUsed, pointCurrent, pointMinPct, pointMaxPct, pointMinValue, pointMaxValue ]);

  return <StyledSlider
      valueLabelDisplay={valueLabelDisplay}
      onChange={onSliderChange}
      min={pointMinPct}
      step={step}
      max={pointMaxPct}
      marks={sliderMarks}
      valueLabelFormat={(value) => value !== pointMinPct && value !== pointMaxPct && value !== pointUsed && labelRender(value)}
      disabled={disabled}
      value={sliderValue ? sliderValue : pointCurrent}
      used={pointUsed}
      // appTheme
  />
}
