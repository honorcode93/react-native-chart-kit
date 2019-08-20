import React from 'react'
import {View} from 'react-native'
import {Svg, Circle, Polygon, Polyline, Path, Rect, G} from 'react-native-svg'
import AbstractChart from './abstract-chart'

class LineChart extends AbstractChart {
  getColor = (dataset, opacity) => {
    return (dataset.color || this.props.chartConfig.color)(opacity)
  }

  getStrokeWidth = dataset => {
    return dataset.strokeWidth || this.props.chartConfig.strokeWidth || 3
  }

  getDatas = data =>
    data.reduce((acc, item) => (item.data ? [...acc, ...item.data] : acc), [])

  renderDots = config => {
    const {
      data,
      width,
      height,
      paddingTop,
      paddingLeft,
      paddingRight,
      onDataPointClick,
      orientation
    } = config
    const output = []
    const datas = this.getDatas(data)
    data.map((dataset, index) => {
      dataset.data.map((x, i) => {
        const cx = orientation === 'left'
          ? paddingLeft + (i * (width - paddingLeft)) / dataset.data.length
          : paddingRight + (i * (width - paddingRight)) / dataset.data.length
        const cy =
          (height / 4) *
            3 *
            (1 - (x - Math.min(...datas)) / this.calcScaler(datas)) +
          paddingTop
        const onPress = () => {
          if (!onDataPointClick) {
            return
          }

          onDataPointClick({
            value: x,
            dataset,
            getColor: opacity => this.getColor(dataset, opacity)
          })
        }

        output.push(
          <Circle
            key={Math.random()}
            cx={cx}
            cy={cy}
            r="4"
            fill={this.getColor(dataset, 0.9)}
            onPress={onPress}
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
        )
      })
    })
    return output
  }

  renderShadow = config => {
    if (this.props.bezier) {
      return this.renderBezierShadow(config)
    }

    const {data, width, height, paddingLeft, paddingTop, paddingRight, orientation} = config
    const output = []
    const datas = this.getDatas(data)
    const baseHeight = this.calcBaseHeight(datas, height)
    config.data.map((dataset, index) => {
      output.push(
        <Polygon
          key={index}
          points={
            dataset.data
              .map(
                (d, i) => {
                  const x = orientation === 'left'
                  ? paddingLeft + (i * (width - paddingLeft)) / dataset.data.length
                  : paddingRight + (i * (width - paddingRight)) / dataset.data.length
                  const y = (baseHeight -  this.calcHeight(d, datas, height)) / 4 * 3 + paddingTop
                  return `${x},${y}`
                }
              )
              .join(' ') +
            ` ${paddingRight +
              ((width - paddingRight) / dataset.data.length) *
                (dataset.data.length - 1)},${(height / 4) * 3 +
              paddingTop} ${paddingRight},${(height / 4) * 3 + paddingTop}`
          }
          fill="url(#fillShadowGradient)"
          strokeWidth={0}
        />
      )
    })
    return output
  }

  renderLine = config => {
    if (this.props.bezier) {
      return this.renderBezierLine(config)
    }

    const {width, height, paddingLeft, paddingTop, data, paddingRight, orientation} = config
    const output = []
    const datas = this.getDatas(data)
    const baseHeight = this.calcBaseHeight(datas, height)
    data.forEach((dataset, index) => {
      const points = dataset.data.map(
        (d, i) => {
          const x  = (i * (width - paddingLeft)) / dataset.data.length + paddingLeft
          const y = (baseHeight -  this.calcHeight(d, datas, height)) / 4 * 3 + paddingTop
          return `${x},${y}`
        }
      )

      output.push(
        <Polyline
          key={index}
          points={points.join(' ')}
          fill="none"
          stroke={this.getColor(dataset, 0.2)}
          strokeWidth={this.getStrokeWidth(dataset)}
        />
      )
    })

    return output
  }

  getBezierLinePoints = (dataset, config) => {
    const {width, height, paddingLeft, paddingTop, data} = config
    if (dataset.data.length === 0) {
      return 'M0,0'
    }

    const datas = this.getDatas(data)
    const x = i =>
      Math.floor(
        paddingLeft + (i * (width - paddingLeft)) / dataset.data.length
      )
    const baseHeight = this.calcBaseHeight(datas, height)
    const y = i => {
      const yHeight = this.calcHeight(dataset.data[i], datas, height)
      return Math.floor((baseHeight - yHeight) / 4 * 3 + paddingTop)
    }

    return [`M${x(0)},${y(0)}`]
      .concat(
        dataset.data.slice(0, -1).map((_, i) => {
          const x_mid = (x(i) + x(i + 1)) / 2
          const y_mid = (y(i) + y(i + 1)) / 2
          const cp_x1 = (x_mid + x(i)) / 2
          const cp_x2 = (x_mid + x(i + 1)) / 2
          return (
            `Q ${cp_x1}, ${y(i)}, ${x_mid}, ${y_mid}` +
            ` Q ${cp_x2}, ${y(i + 1)}, ${x(i + 1)}, ${y(i + 1)}`
          )
        })
      )
      .join(' ')
  }

  renderBezierLine = config => {
    const output = []
    config.data.map((dataset, index) => {
      const result = this.getBezierLinePoints(dataset, config)
      output.push(
        <Path
          key={index}
          d={result}
          fill="none"
          stroke={this.getColor(dataset, 0.2)}
          strokeWidth={this.getStrokeWidth(dataset)}
        />
      )
    })
    return output
  }

  renderBezierShadow = config => {
    const {width, height, paddingLeft, paddingTop, paddingRight, data} = config
    const output = []
    data.map((dataset, index) => {
      const d =
        this.getBezierLinePoints(dataset, config) +
        ` L${paddingLeft +
          ((width - paddingLeft) / dataset.data.length) *
            (dataset.data.length - 1)},${(height / 4) * 3 +
          paddingTop} L${paddingLeft},${(height / 4) * 3 + paddingTop} Z`
      output.push(
        <Path
          key={index}
          d={d}
          fill="url(#fillShadowGradient)"
          strokeWidth={0}
        />
      )
    })
    return output
  }

  render() {
    const {
      width,
      height,
      data,
      withShadow = true,
      withDots = true,
      withInnerLines = true,
      withVerticalInnerLines = true,
      withHorizontalInnerLines = true,
      withOuterLines = true,
      withVerticalOuterLines = true,
      withHorizontalOuterLines = true,
      withHorizontalLabels = true,
      withVerticalLabels = true,
      horizontalLabelsOrientation = 'left',
      innerLinesProps = {},
      outerLinesProps = {},
      style = {},
      decorator,
      onDataPointClick,
    } = this.props
    const paddingTop = 16
    const paddingLeft = horizontalLabelsOrientation === 'right' ? 0 : 64
    const paddingRight = horizontalLabelsOrientation === 'right' ? 64 : 0
    const {labels = []} = data
    const {borderRadius = 0} = style
    const config = {
      width,
      height,
      innerLinesProps,
      outerLinesProps,
    }
    const datas = this.getDatas(data.datasets)
    return (
      <View style={style}>
        <Svg height={height} width={width}>
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
              {withInnerLines && withHorizontalInnerLines
                ? this.renderHorizontalLines({
                    ...config,
                    count: 4,
                    paddingTop,
                    paddingLeft,
                    paddingRight
                  })
                : withOuterLines && withHorizontalOuterLines
                ? this.renderHorizontalLine({
                    ...config,
                    paddingTop,
                    paddingLeft,
                    paddingRight
                  })
                : null}
            </G>
            <G>
              {withHorizontalLabels
                ? this.renderHorizontalLabels({
                ...config,
                count: Math.min(...datas) === Math.max(...datas) ? 1 : 4,
                data: datas,
                paddingTop,
                paddingLeft,
                paddingRight,
                orientation: horizontalLabelsOrientation
              })
              : null}
            </G>
            <G>
              {withInnerLines && withVerticalInnerLines
                ? this.renderVerticalLines({
                    ...config,
                    data: data.datasets[0].data,
                    paddingTop,
                    paddingLeft,
                    paddingRight
                  })
                : withOuterLines && withVerticalOuterLines
                ? this.renderVerticalLine({
                    ...config,
                    paddingTop,
                    paddingLeft,
                    paddingRight
                  })
                : null}
            </G>
            <G>
              {withVerticalLabels
                ? this.renderVerticalLabels({
                ...config,
                labels,
                paddingLeft,
                paddingTop,
                paddingRight
              })
              : null}
            </G>
            <G>
              {this.renderLine({
                ...config,
                paddingLeft,
                paddingTop,
                paddingRight,
                data: data.datasets
              })}
            </G>
            <G>
              {withShadow &&
                this.renderShadow({
                  ...config,
                  data: data.datasets,
                  paddingLeft,
                  paddingRight,
                  paddingTop,
                  orientation: horizontalLabelsOrientation
                })}
            </G>
            <G>
              {withDots &&
                this.renderDots({
                  ...config,
                  data: data.datasets,
                  paddingTop,
                  paddingRight,
                  paddingLeft,
                  onDataPointClick,
                  orientation: horizontalLabelsOrientation
                })}
            </G>
            <G>
              {decorator &&
                decorator({
                  ...config,
                  data: data.datasets,
                  paddingTop,
                  paddingLeft,
                  paddingRight,
                  orientation: horizontalLabelsOrientation
                })}
            </G>
          </G>
        </Svg>
      </View>
    )
  }
}

export default LineChart
