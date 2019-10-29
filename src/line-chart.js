import React from "react";
import { View } from "react-native";
import {
  Svg,
  Circle,
  Polygon,
  Polyline,
  Path,
  Rect,
  G
} from "react-native-svg";
import AbstractChart from "./abstract-chart";

class LineChart extends AbstractChart {
  getColor = (dataset, opacity) => {
    return (dataset.color || this.props.chartConfig.color)(opacity);
  };

  getStrokeWidth = dataset => {
    return dataset.strokeWidth || this.props.chartConfig.strokeWidth || 3;
  };

  getDatas = data =>
    data.reduce((acc, item) => (item.data ? [...acc, ...item.data] : acc), []);

  getPropsForDots = () => {
    const { propsForDots = {} } = this.props.chartConfig;
    return { r: "4", ...propsForDots };
  };
  renderDots = config => {
    const {
      data,
      width,
      height,
      paddingTop,
      paddingRight,
      onDataPointClick,
      count,
      horizontalLabels = null,
      orientation
    } = config;
    const output = [];
    const datas = this.getDatas(data);
    const baseHeight = this.calcBaseHeight(datas, height);
    const { getDotColor, hidePointsAtIndex = [] } = this.props;

    const usedCount =
      horizontalLabels !== null ? horizontalLabels.length : count;
    const usedPaddingRight = orientation === "left" ? 0 : paddingRight;

    data.forEach(dataset => {
      dataset.data.forEach((x, i) => {
        if (hidePointsAtIndex.includes(i)) {
          return;
        }
        const cx =
          usedPaddingRight +
          (i * (width - usedPaddingRight)) / dataset.data.length;
        const cy =
          ((baseHeight -
            this.calcHeight(x, horizontalLabels || datas, height)) /
            usedCount) *
            (usedCount - 1) +
          paddingTop;
        const onPress = () => {
          if (!onDataPointClick || hidePointsAtIndex.includes(i)) {
            return;
          }

          onDataPointClick({
            index: i,
            value: x,
            dataset,
            x: cx,
            y: cy,
            getColor: opacity => this.getColor(dataset, opacity)
          });
        };

        output.push(
          <Circle
            key={Math.random()}
            cx={cx}
            cy={cy}
            fill={
              typeof getDotColor === "function"
                ? getDotColor(x, i)
                : this.getColor(dataset, 0.9)
            }
            onPress={onPress}
            {...this.getPropsForDots()}
          />,
          <Circle
            key={Math.random()}
            cx={cx}
            cy={cy}
            r="12"
            fill="#fff"
            fillOpacity={0}
            onPress={onPress}
          />
        );
      });
    });
    return output;
  };

  renderShadow = config => {
    if (this.props.bezier) {
      return this.renderBezierShadow(config);
    }

    const { data, width, height, paddingRight, paddingTop } = config;
    const datas = this.getDatas(data);
    const baseHeight = this.calcBaseHeight(datas, height);
    return config.data.map((dataset, index) => {
      return (
        <Polygon
          key={index}
          points={
            dataset.data
              .map((d, i) => {
                const x =
                  paddingRight +
                  (i * (width - paddingRight)) / dataset.data.length;
                const y =
                  ((baseHeight - this.calcHeight(d, datas, height)) / 4) * 3 +
                  paddingTop;
                return `${x},${y}`;
              })
              .join(" ") +
            ` ${paddingRight +
              ((width - paddingRight) / dataset.data.length) *
                (dataset.data.length - 1)},${(height / 4) * 3 +
              paddingTop} ${paddingRight},${(height / 4) * 3 + paddingTop}`
          }
          fill="url(#fillShadowGradient)"
          strokeWidth={0}
        />
      );
    });
  };

  renderLine = config => {
    if (this.props.bezier) {
      return this.renderBezierLine(config);
    }

    const {
      width,
      height,
      paddingRight,
      paddingTop,
      data,
      orientation,
      horizontalLabels = null,
      count = 4
    } = config;
    const output = [];
    const datas = this.getDatas(data);
    const baseHeight = this.calcBaseHeight(datas, height);
    const usedPaddingRight = orientation === "left" ? 0 : paddingRight;
    const usedCount =
      horizontalLabels !== null ? horizontalLabels.length : count;
    data.forEach((dataset, index) => {
      const points = dataset.data.map((d, i) => {
        const x =
          (i * (width - usedPaddingRight)) / dataset.data.length +
          usedPaddingRight;
        const y =
          ((baseHeight - this.calcHeight(d, datas, height)) / usedCount) *
            (usedCount - 1) +
          paddingTop;
        return `${x},${y}`;
      });

      output.push(
        <Polyline
          key={index}
          points={points.join(" ")}
          fill="none"
          stroke={this.getColor(dataset, 0.2)}
          strokeWidth={this.getStrokeWidth(dataset)}
        />
      );
    });

    return output;
  };

  getBezierLinePoints = (dataset, config) => {
    const {
      width,
      height,
      paddingRight,
      paddingTop,
      data,
      orientation,
      horizontalLabels = null,
      count = 4
    } = config;
    if (dataset.data.length === 0) {
      return "M0,0";
    }

    const usedPaddingRight = orientation === "left" ? 0 : paddingRight;
    const usedCount =
      horizontalLabels !== null ? horizontalLabels.length : count;

    const datas = this.getDatas(data);
    const x = i =>
      Math.floor(
        usedPaddingRight +
          (i * (width - usedPaddingRight)) / dataset.data.length
      );
    const baseHeight = this.calcBaseHeight(datas, height);
    const y = i => {
      const yHeight = this.calcHeight(
        dataset.data[i],
        horizontalLabels || datas,
        height
      );
      return Math.floor(
        ((baseHeight - yHeight) / usedCount) * (usedCount - 1) + paddingTop
      );
    };

    return [`M${x(0)},${y(0)}`]
      .concat(
        dataset.data.slice(0, -1).map((_, i) => {
          const x_mid = (x(i) + x(i + 1)) / 2;
          const y_mid = (y(i) + y(i + 1)) / 2;
          const cp_x1 = (x_mid + x(i)) / 2;
          const cp_x2 = (x_mid + x(i + 1)) / 2;
          return (
            `Q ${cp_x1}, ${y(i)}, ${x_mid}, ${y_mid}` +
            ` Q ${cp_x2}, ${y(i + 1)}, ${x(i + 1)}, ${y(i + 1)}`
          );
        })
      )
      .join(" ");
  };

  renderBezierLine = config => {
    return config.data.map((dataset, index) => {
      const result = this.getBezierLinePoints(dataset, config);
      return (
        <Path
          key={index}
          d={result}
          fill="none"
          stroke={this.getColor(dataset, 0.2)}
          strokeWidth={this.getStrokeWidth(dataset)}
        />
      );
    });
  };

  renderBezierShadow = config => {
    const { width, height, paddingRight, paddingTop, data } = config;
    return data.map((dataset, index) => {
      const d =
        this.getBezierLinePoints(dataset, config) +
        ` L${paddingRight +
          ((width - paddingRight) / dataset.data.length) *
            (dataset.data.length - 1)},${(height / 4) * 3 +
          paddingTop} L${paddingRight},${(height / 4) * 3 + paddingTop} Z`;
      return (
        <Path
          key={index}
          d={d}
          fill="url(#fillShadowGradient)"
          strokeWidth={0}
        />
      );
    });
  };

  render() {
    const {
      width,
      height,
      data,
      withShadow = true,
      withDots = true,
      withInnerLines = true,
      withOuterLines = true,
      withHorizontalLabels = true,
      withVerticalLabels = true,
      style = {},
      decorator,
      onDataPointClick,
      verticalLabelRotation = 0,
      horizontalLabelRotation = 0
    } = this.props;
    const { labels = [] } = data;
    const { borderRadius = 0, paddingTop = 16, paddingRight = 64 } = style;
    const config = {
      width,
      height,
      verticalLabelRotation,
      horizontalLabelRotation,
      orientation: this.props.chartConfig.orientation || "right"
    };
    const datas = this.getDatas(data.datasets);
    return (
      <View style={style}>
        <Svg
          height={height}
          width={width - width / data.datasets[0].data.length + paddingRight}
        >
          <G>
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
                    count: 4,
                    labels: data.horizontalLabels,
                    count: this.props.chartConfig.count || 4,
                    paddingTop,
                    paddingRight
                  })
                : withOuterLines
                ? this.renderHorizontalLine({
                    ...config,
                    paddingTop,
                    paddingRight
                  })
                : null}
            </G>
            <G>
              {withHorizontalLabels
                ? this.renderHorizontalLabels({
                    ...config,
                    labels: data.horizontalLabels,
                    count: this.props.chartConfig.count || 4,
                    data: datas,
                    paddingTop,
                    paddingRight
                  })
                : null}
            </G>
            <G>
              {withInnerLines
                ? this.renderVerticalLines({
                    ...config,
                    data: data.datasets[0].data,
                    paddingTop,
                    paddingRight
                  })
                : withOuterLines
                ? this.renderVerticalLine({
                    ...config,
                    paddingTop,
                    paddingRight
                  })
                : null}
            </G>
            <G>
              {withVerticalLabels
                ? this.renderVerticalLabels({
                    ...config,
                    labels,
                    horizontalLabels: data.horizontalLabels,
                    count: this.props.chartConfig.count || 4,
                    paddingRight,
                    paddingTop
                  })
                : null}
            </G>
            <G>
              {this.renderLine({
                ...config,
                paddingRight,
                paddingTop,
                horizontalLabels: data.horizontalLabels,
                count: this.props.chartConfig.count || 4,
                data: data.datasets
              })}
            </G>
            <G>
              {withShadow &&
                this.renderShadow({
                  ...config,
                  data: data.datasets,
                  paddingRight,
                  paddingTop
                })}
            </G>
            <G>
              {withDots &&
                this.renderDots({
                  ...config,
                  data: data.datasets,
                  horizontalLabels: data.horizontalLabels,
                  paddingTop,
                  count: this.props.chartConfig.count || 4,
                  paddingRight,
                  onDataPointClick
                })}
            </G>
            <G>
              {decorator &&
                decorator({
                  ...config,
                  data: data.datasets,
                  paddingTop,
                  paddingRight
                })}
            </G>
          </G>
        </Svg>
      </View>
    );
  }
}

export default LineChart;
