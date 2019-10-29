import React, { Component } from "react";

import { LinearGradient, Line, Text, Defs, Stop } from "react-native-svg";

class AbstractChart extends Component {
  calcScaler = data => {
    if (this.props.fromZero) {
      return Math.max(...data, 0) - Math.min(...data, 0) || 1;
    } else {
      return Math.max(...data) - Math.min(...data) || 1;
    }
  };

  calcBaseHeight = (data, height) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    if (min >= 0 && max >= 0) {
      return height;
    } else if (min < 0 && max <= 0) {
      return 0;
    } else if (min < 0 && max > 0) {
      return (height * max) / this.calcScaler(data);
    }
  };

  calcHeight = (val, data, height) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    if (min < 0 && max > 0) {
      return height * (val / this.calcScaler(data));
    } else if (min >= 0 && max >= 0) {
      return this.props.fromZero
        ? height * (val / this.calcScaler(data))
        : height * ((val - min) / this.calcScaler(data));
    } else if (min < 0 && max <= 0) {
      return this.props.fromZero
        ? height * (val / this.calcScaler(data))
        : height * ((val - max) / this.calcScaler(data));
    }
  };

  getPropsForBackgroundLines(isVertical) {
    const { propsForBackgroundLines = {} } = this.props.chartConfig;

    const { vertical = {}, horizontal = {}, ...rest } = propsForBackgroundLines;

    return {
      stroke: this.props.chartConfig.color(0.2),
      strokeDasharray: "5, 10",
      strokeWidth: 1,
      ...rest,
      ...(isVertical ? vertical : horizontal)
    };
  }

  getPropsForLabels() {
    const {
      propsForLabels = {},
      color,
      labelColor = color
    } = this.props.chartConfig;
    return {
      fontSize: 12,
      fill: labelColor(0.8),
      ...propsForLabels
    };
  }

  renderHorizontalLines = config => {
    const {
      labels = null,
      count,
      width,
      height,
      paddingTop = 16,
      paddingRight = 64,
      orientation = "right"
    } = config;
    return (labels || [...new Array(count)]).map((_, i) => {
      const usedCount = labels !== null ? labels.length : count;

      const y = (height / usedCount) * i + paddingTop;
      return (
        <Line
          key={Math.random()}
          x1={orientation === "left" ? 0 : paddingRight}
          y1={y}
          x2={orientation === "left" ? width - paddingRight : width}
          y2={y}
          {...this.getPropsForBackgroundLines(false)}
        />
      );
    });
  };

  renderHorizontalLine = config => {
    const { width, height, paddingTop, paddingRight } = config;
    return (
      <Line
        key={Math.random()}
        x1={paddingRight}
        y1={height - height / 4 + paddingTop}
        x2={width}
        y2={height - height / 4 + paddingTop}
        {...this.getPropsForBackgroundLines(false)}
      />
    );
  };

  renderHorizontalLabels = config => {
    const {
      labels = null,
      count,
      data,
      height,
      paddingTop,
      width,
      orientation,
      paddingRight,
      horizontalLabelRotation = 0
    } = config;
    const {
      yAxisLabel = "",
      yAxisSuffix = "",
      yLabelsOffset = 12,
      chartConfig
    } = this.props;
    const { decimalPlaces = 2 } = chartConfig;
    return (labels || [...new Array(count)]).map((givenLabel, i) => {
      let yLabel = givenLabel;

      const usedCount = labels !== null ? labels.length : count;

      if (labels === null) {
        if (usedCount === 1) {
          yLabel = `${yAxisLabel}${data[0].toFixed(
            decimalPlaces
          )}${yAxisSuffix}`;
        } else {
          const label = this.props.fromZero
            ? (this.calcScaler(data) / (usedCount - 1)) * i +
              Math.min(...data, 0)
            : (this.calcScaler(data) / (usedCount - 1)) * i + Math.min(...data);
          yLabel = `${yAxisLabel}${label.toFixed(decimalPlaces)}${yAxisSuffix}`;
        }
      }

      const x = (orientation === "left" ? width : paddingRight) - yLabelsOffset;
      /*
      const y =
        usedCount === 1 && this.props.fromZero
          ? paddingTop + 4
          : (height * 3) / 4 - ((height - paddingTop) / usedCount) * i + 12;
      */
      const y = height - (height / usedCount) * (i + 1) + paddingTop;
      const labelProps = {
        rotation: horizontalLabelRotation,
        origin: `${x}, ${y}`,
        key: Math.random(),
        x,
        textAnchor: "end",
        y,
        ...this.getPropsForLabels()
      };

      return this.renderHorizontalLabel(yLabel, labelProps);
    });
  };

  renderHorizontalLabel = (yLabel, labelProps) => {
    const { renderHorizontalLabel = null } = this.props.chartConfig;
    if (renderHorizontalLabel !== null) {
      return renderHorizontalLabel(yLabel, labelProps);
    }

    return <Text {...labelProps}>{yLabel}</Text>;
  };

  renderVerticalLabels = config => {
    const {
      labels = [],
      count = 4,
      horizontalLabels = null,
      width,
      height,
      paddingRight,
      paddingTop,
      horizontalOffset = 0,
      stackedBar = false,
      verticalLabelRotation = 0,
      orientation
    } = config;
    const {
      xAxisLabel = "",
      xLabelsOffset = 0,
      hidePointsAtIndex = []
    } = this.props;
    const fontSize = 12;
    let fac = 1;
    if (stackedBar) {
      fac = 0.71;
    }

    const usedPaddingRight = orientation === "left" ? 12 : paddingRight;
    const usedCount =
      horizontalLabels !== null ? horizontalLabels.length : count;
    return labels.map((label, i) => {
      if (hidePointsAtIndex.includes(i)) {
        return null;
      }
      const x =
        (((width - paddingRight) / labels.length) * i +
          usedPaddingRight +
          horizontalOffset) *
        fac;
      const y =
        (height * (usedCount - 1)) / usedCount +
        paddingTop +
        fontSize * 2 +
        xLabelsOffset;
      return (
        <Text
          origin={`${x}, ${y}`}
          rotation={verticalLabelRotation}
          key={Math.random()}
          x={x}
          y={y}
          textAnchor={verticalLabelRotation === 0 ? "middle" : "start"}
          {...this.getPropsForLabels()}
        >
          {`${label}${xAxisLabel}`}
        </Text>
      );
    });
  };

  renderVerticalLines = config => {
    const { data, width, height, paddingTop, paddingRight } = config;
    return [...new Array(data.length)].map((_, i) => {
      return (
        <Line
          key={Math.random()}
          x1={Math.floor(
            ((width - paddingRight) / data.length) * i + paddingRight
          )}
          y1={0}
          x2={Math.floor(
            ((width - paddingRight) / data.length) * i + paddingRight
          )}
          y2={height - height / 4 + paddingTop}
          {...this.getPropsForBackgroundLines(true)}
        />
      );
    });
  };

  renderVerticalLine = config => {
    const { height, paddingTop, paddingRight } = config;
    return (
      <Line
        key={Math.random()}
        x1={Math.floor(paddingRight)}
        y1={0}
        x2={Math.floor(paddingRight)}
        y2={height - height / 4 + paddingTop}
        {...this.getPropsForBackgroundLines(true)}
      />
    );
  };

  renderDefs = config => {
    const {
      width,
      height,
      backgroundGradientFrom,
      backgroundGradientTo
    } = config;
    const fromOpacity = config.hasOwnProperty("backgroundGradientFromOpacity")
      ? config.backgroundGradientFromOpacity
      : 1.0;
    const toOpacity = config.hasOwnProperty("backgroundGradientToOpacity")
      ? config.backgroundGradientToOpacity
      : 1.0;

    const fillShadowGradient = config.hasOwnProperty("fillShadowGradient")
      ? config.fillShadowGradient
      : this.props.chartConfig.color();

    const fillShadowGradientOpacity = config.hasOwnProperty(
      "fillShadowGradientOpacity"
    )
      ? config.fillShadowGradientOpacity
      : 0.1;

    return (
      <Defs>
        <LinearGradient
          id="backgroundGradient"
          x1="0"
          y1={height}
          x2={width}
          y2={0}
        >
          <Stop
            offset="0"
            stopColor={backgroundGradientFrom}
            stopOpacity={fromOpacity}
          />
          <Stop
            offset="1"
            stopColor={backgroundGradientTo}
            stopOpacity={toOpacity}
          />
        </LinearGradient>
        <LinearGradient
          id="fillShadowGradient"
          x1={0}
          y1={0}
          x2={0}
          y2={height}
        >
          <Stop
            offset="0"
            stopColor={fillShadowGradient}
            stopOpacity={fillShadowGradientOpacity}
          />
          <Stop offset="1" stopColor={fillShadowGradient} stopOpacity="0" />
        </LinearGradient>
      </Defs>
    );
  };
}

export default AbstractChart;
