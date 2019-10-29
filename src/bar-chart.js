import React from "react";
import { View } from "react-native";
import { Svg, Rect, G } from "react-native-svg";
import AbstractChart from "./abstract-chart";

const barWidth = 32;

class BarChart extends AbstractChart {
  getBarPercentage = () => {
    const { barPercentage = 1 } = this.props.chartConfig;
    return barPercentage;
  };

  getBarProps = (value, index) => {
    const { getBarProps = null, barProps = {} } = this.props.chartConfig;

    return {
      ...barProps,
      ...(getBarProps ? getBarProps(value, index) : {})
    };
  };

  getBarTopProps = (value, index) => {
    const { getBarTopProps = null, barTopProps = {} } = this.props;

    return {
      ...barTopProps,
      ...(getBarTopProps ? getBarTopProps(value, index) : {})
    };
  };

  renderBars = config => {
    const {
      data,
      width,
      height,
      paddingTop,
      paddingRight,
      orientation,
      labels = null
    } = config;
    const baseHeight = this.calcBaseHeight(data, height);
    return data.map((x, i) => {
      const barHeight = this.calcHeight(x, labels || data, height);
      const barWidth = 32 * this.getBarPercentage();

      const totalLabels = labels !== null ? labels.length : 4;
      return (
        <Rect
          key={Math.random()}
          x={
            (orientation === "left" ? 12 : paddingRight) +
            (i * (width - paddingRight)) / data.length +
            barWidth / 2
          }
          y={
            ((baseHeight - barHeight) / totalLabels) * (totalLabels - 1) +
            paddingTop
          }
          width={barWidth}
          height={(Math.abs(barHeight) / totalLabels) * (totalLabels - 1)}
          fill="url(#fillShadowGradient)"
          {...this.getBarProps(x, i)}
        />
      );
    });
  };

  renderBarTops = config => {
    const {
      data,
      width,
      height,
      paddingTop,
      paddingRight,
      orientation,
      labels = null
    } = config;
    const baseHeight = this.calcBaseHeight(data, height);
    return data.map((x, i) => {
      const barHeight = this.calcHeight(x, labels || data, height);
      const barWidth = 32 * this.getBarPercentage();
      const totalLabels = labels !== null ? labels.length : 4;
      return (
        <Rect
          key={Math.random()}
          x={
            (orientation === "left" ? 12 : paddingRight) +
            (i * (width - paddingRight)) / data.length +
            barWidth / 2
          }
          y={
            ((baseHeight - barHeight) / totalLabels) * (totalLabels - 1) +
            paddingTop
          }
          width={barWidth}
          height={2}
          fill={this.props.chartConfig.color(0.6)}
          {...this.getBarTopProps()}
        />
      );
    });
  };

  render() {
    const {
      width,
      height,
      data,
      style = {},
      chartConfig,
      withHorizontalLabels = true,
      withVerticalLabels = true,
      verticalLabelRotation = 0,
      horizontalLabelRotation = 0,
      withInnerLines = true
    } = this.props;

    const { orientation } = chartConfig;

    const { borderRadius = 0, paddingTop = 16, paddingRight = 64 } = style;
    const config = {
      width,
      height,
      verticalLabelRotation,
      horizontalLabelRotation,
      orientation
    };
    return (
      <View style={style}>
        <Svg height={height} width={width}>
          {this.renderDefs({
            ...config,
            ...this.props.chartConfig
          })}
          <Rect
            width="100%"
            height={height}
            rx={borderRadius}
            ry={borderRadius}
            fill="url(#backgroundGradient)"
          />
          <G>
            {withInnerLines
              ? this.renderHorizontalLines({
                  ...config,
                  labels: data.horizontalLabels,
                  count: this.props.chartConfig.count || 4,
                  paddingTop
                })
              : null}
          </G>
          <G>
            {withHorizontalLabels
              ? this.renderHorizontalLabels({
                  ...config,
                  labels: data.horizontalLabels,
                  count: this.props.chartConfig.count || 4,
                  data: data.datasets[0].data,
                  paddingTop,
                  paddingRight
                })
              : null}
          </G>
          <G>
            {withVerticalLabels
              ? this.renderVerticalLabels({
                  ...config,
                  labels: data.labels,
                  horizontalLabels: data.horizontalLabels,
                  count: this.props.chartConfig.count || 4,
                  paddingRight,
                  paddingTop,
                  horizontalOffset: barWidth * this.getBarPercentage()
                })
              : null}
          </G>
          <G>
            {this.renderBars({
              ...config,
              data: data.datasets[0].data,
              labels: data.horizontalLabels,
              paddingTop,
              paddingRight
            })}
          </G>
          <G>
            {this.renderBarTops({
              ...config,
              data: data.datasets[0].data,
              labels: data.horizontalLabels,
              paddingTop,
              paddingRight
            })}
          </G>
        </Svg>
      </View>
    );
  }
}

export default BarChart;
