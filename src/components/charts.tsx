import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useTheme } from '../theme';
import { Label, Row } from './ui';
import { parseDate } from '../utils/date';
export function ActivityChart({data}: {data:{day:string;value:number}[]}){const t=useTheme();const {width}=useWindowDimensions();const shown=data.length>7?Array.from({length:Math.ceil(data.length/5)},(_,i)=>({day:data[i*5].day,value:data.slice(i*5,i*5+5).reduce((n,x)=>n+x.value,0)})):data;return <View style={{overflow:'hidden',paddingTop:8}}><BarChart data={shown.map(d=>({value:d.value,label:parseDate(d.day).toLocaleDateString(undefined,data.length>7?{month:'short',day:'numeric'}:{weekday:'short'}),frontColor:t.primary,topLabelComponent:()=>d.value?<Label size={10} muted>{d.value}</Label>:null}))} width={Math.min(width-118,820)} height={125} barWidth={20} spacing={Math.max(12,(Math.min(width-118,820)-shown.length*20)/shown.length)} initialSpacing={10} barBorderRadius={5} noOfSections={3} maxValue={Math.max(3,...shown.map(d=>d.value))} yAxisThickness={0} xAxisThickness={0} hideRules hideYAxisText xAxisLabelTextStyle={{color:t.muted,fontSize:10}} isAnimated animationDuration={400}/></View>;}
