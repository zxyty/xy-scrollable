/* eslint-disable no-nested-ternary */
import React from 'react';
import debounce from 'lodash/debounce';
import './index.less';
import { pxToBasePercent, getScrollTotalHeightAndWidth } from './Utils';

interface ProcessBarProps {
  direction?: 'x' | 'y';
  barHandlerLen?: string;
  handleBarScroll?: () => void;
  totalHeightCount?: number;
  totalWidthCount?: number;
  onScroll?: (
    direction: 'x' | 'y',
    percent: number,
    length: number,
    scrollDomStyle: {
      totalWidthCount: number;
      totalHeightCount: number;
    },
  ) => void;
  onDidMount?: () => void;
}

interface ProcessBarState {
  offsetLeft?: number;
  offsetTop?: number;
  baseWidth?: number;
  baseHeight?: number;
}

class ProcessBar extends React.PureComponent<ProcessBarProps, ProcessBarState> {
  processBarRef: InstanceType<typeof HTMLDivElement>;

  processBarHandlerRef: InstanceType<typeof HTMLDivElement>;

  state: ProcessBarState = {
    offsetLeft: 0,
    offsetTop: 0,
    baseWidth: 0,
    baseHeight: 0,
  };

  componentDidMount() {
    const { onDidMount } = this.props;
    if (onDidMount) {
      onDidMount();
    }
  }

  handleOnMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();

    const { clientX: initX, clientY: initY } = event;
    const { style } = event.target as HTMLDivElement;
    const initStyleX = parseInt(style.left, 10) || 0;
    const initStyleY = parseInt(style.top, 10) || 0;

    const {
      offsetHeight: baseHeight,
      offsetWidth: baseWidth,
    } = this.processBarRef;

    document.onmousemove = (e: MouseEvent) => {
      const { clientX: endX, clientY: endY } = e;
      const offsetX = endX - initX;
      const offsetY = endY - initY;

      this.handleMouseMove(e, {
        offsetX,
        offsetY,
        baseHeight,
        baseWidth,
        initStyleX,
        initStyleY,
      });
    };

    document.onmouseup = (e: MouseEvent) => {
      document.onmousemove = null;
      document.onmouseup = null;
      const { clientX: endX, clientY: endY } = e;
      const offsetX = endX - initX;
      const offsetY = endY - initY;

      this.handleMouseMove(e, {
        offsetX,
        offsetY,
        baseHeight,
        baseWidth,
        initStyleX,
        initStyleY,
      });
    };
  };

  handleMouseMove = (
    _: MouseEvent,
    { offsetX, offsetY, baseHeight, baseWidth, initStyleX, initStyleY },
  ) => {
    const {
      direction = 'x',
      onScroll,
      barHandlerLen = '0%',
      totalWidthCount = 0,
      totalHeightCount = 0,
    } = this.props;
    let percent = 0;
    let length;
    if (direction === 'x') {
      const offsetLeft = offsetX + initStyleX;
      this.setState({
        offsetLeft,
        baseWidth,
      });

      const currUseWidth = parseInt(
        String((parseInt(barHandlerLen, 10) * baseWidth) / 100),
        10,
      );

      const validLeft =
        offsetLeft <= 0
          ? 0
          : offsetLeft + currUseWidth >= baseWidth
          ? baseWidth - currUseWidth
          : offsetLeft;

      percent = parseFloat((validLeft / baseWidth).toFixed(2));
      length = offsetX;
    } else if (direction === 'y') {
      const offsetTop = offsetY + initStyleY;
      this.setState({
        offsetTop,
        baseHeight,
      });

      const currUseHeight = parseInt(
        String((parseInt(barHandlerLen, 10) * baseHeight) / 100),
        10,
      );

      const validTop =
        offsetTop <= 0
          ? 0
          : offsetTop + currUseHeight >= baseHeight
          ? baseHeight - currUseHeight
          : offsetTop;

      percent = parseFloat((validTop / baseHeight).toFixed(2));
      length = offsetY;
    }

    if (onScroll) {
      onScroll(direction, percent, length, {
        totalWidthCount,
        totalHeightCount,
      });
    }
  };

  handleActionMouseDown = (type: 'prev' | 'next') => (event: any) => {
    event.preventDefault();
    event.stopPropagation();

    const { style } = this.processBarHandlerRef;
    const initStyleX = parseInt(style.left, 10) || 0;
    const initStyleY = parseInt(style.top, 10) || 0;

    const {
      offsetHeight: baseHeight,
      offsetWidth: baseWidth,
    } = this.processBarRef;

    let offsetX = 0;
    let offsetY = 0;

    if (type === 'next') {
      offsetX = 20;
      offsetY = 20;
    } else if (type === 'prev') {
      offsetX = -20;
      offsetY = -20;
    }

    const handleMove = (direction: 'prev' | 'next') => {
      return () => {
        if (direction === 'prev') {
          offsetX -= 20;
          offsetY -= 20;
        } else if (direction === 'next') {
          offsetX += 20;
          offsetY += 20;
        }
        this.handleMouseMove({} as MouseEvent, {
          offsetX,
          offsetY,
          baseHeight,
          baseWidth,
          initStyleX,
          initStyleY,
        });
      };
    };

    // 立即执行移动
    handleMove(type)();

    // 如果在持续按键不放则一直移动
    const upTimer = setInterval(handleMove(type), 100);

    (event.target as HTMLElement).onmouseup = () => {
      if (upTimer) {
        clearInterval(upTimer);
      }
    };
  };

  saveBarRef = ref => {
    this.processBarRef = ref;
  };

  saveBarHandlerRef = ref => {
    this.processBarHandlerRef = ref;
  };

  render() {
    const { direction = 'x', barHandlerLen = '0%' } = this.props;
    const {
      offsetLeft = 0,
      offsetTop = 0,
      baseHeight = 0,
      baseWidth = 0,
    } = this.state;
    const handlerStyle: React.CSSProperties = {};

    if (direction === 'x') {
      if (baseWidth) {
        const currUseWidth = parseInt(
          String((parseInt(barHandlerLen, 10) * baseWidth) / 100),
          10,
        );
        handlerStyle.width = currUseWidth;

        handlerStyle.left =
          offsetLeft <= 0
            ? 0
            : offsetLeft + currUseWidth >= baseWidth
            ? baseWidth - currUseWidth
            : offsetLeft;
      } else {
        handlerStyle.width = barHandlerLen;
      }
    } else if (direction === 'y') {
      if (baseHeight) {
        const currUseHeight = parseInt(
          String((parseInt(barHandlerLen, 10) * baseHeight) / 100),
          10,
        );
        handlerStyle.height = currUseHeight;

        handlerStyle.top =
          offsetTop <= 0
            ? 0
            : offsetTop + currUseHeight >= baseHeight
            ? baseHeight - currUseHeight
            : offsetTop;
      } else {
        handlerStyle.height = barHandlerLen;
      }
    }

    return (
      <div className={`scroll-process-${direction}`}>
        <div
          className="process-prev"
          onMouseDown={this.handleActionMouseDown('prev')}
        />
        <div className="process-bar" ref={this.saveBarRef}>
          <div
            onMouseDown={this.handleOnMouseDown}
            style={handlerStyle}
            className="process-bar-handler"
            ref={this.saveBarHandlerRef}
          />
        </div>
        <div
          className="process-next"
          onMouseDown={this.handleActionMouseDown('next')}
        />
      </div>
    );
  }
}

interface ScrollBarProps {
  direction?: 'x' | 'y';
  getBaseDom: () => HTMLElement;
  getScrollDom: () => HTMLElement;
  getContainerDom: () => HTMLElement;
  getScrollDomWidthAndHeight?: (
    scrollDom: HTMLElement,
  ) => {
    totalWidthCount: number;
    totalHeightCount: number;
  };
}

export default class ScrollBar extends React.PureComponent<ScrollBarProps> {
  constructor(props) {
    super(props);

    this.handleDomResize = debounce(this.handleDomResize, 100);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleDomResize);
  }

  triggerCalcPercent = () => {
    const { getBaseDom, getScrollDom } = this.props;

    const baseDom = getBaseDom();
    const scrollDom = getScrollDom();

    if (!baseDom || !scrollDom) {
      return;
    }

    this.forceUpdate();
  };

  handleScroll = (
    direction,
    percent,
    _,
    { totalWidthCount, totalHeightCount },
  ) => {
    const { getBaseDom, getScrollDom, getContainerDom } = this.props;
    const baseDom = getBaseDom();
    const scrollDom = getScrollDom();
    const containerDom = getContainerDom();
    if (!baseDom || !scrollDom) {
      return;
    }

    const newPercent = percent >= 1 ? 1 : percent <= 0 ? 0 : percent;

    if (direction === 'x') {
      const offsetX = `${parseInt(`${-newPercent * totalWidthCount}`, 10)}px`;
      scrollDom.style.left = offsetX;
      if (containerDom) {
        containerDom.style.left = offsetX;
      }
    } else if (direction === 'y') {
      const offsetY = `${parseInt(`${-newPercent * totalHeightCount}`, 10)}px`;
      scrollDom.style.top = offsetY;
      if (containerDom) {
        containerDom.style.top = offsetY;
      }
    }
  };

  handleBarDidMount = () => {
    const { getBaseDom } = this.props;
    const baseDom = getBaseDom();
    if (!baseDom) {
      return;
    }
    window.addEventListener('resize', this.handleDomResize);
  };

  handleDomResize = _ => {
    setTimeout(() => {
      this.forceUpdate();
    }, 30);
  };

  render() {
    const {
      direction,
      getBaseDom,
      getScrollDom,
      getScrollDomWidthAndHeight = getScrollTotalHeightAndWidth,
    } = this.props;

    const baseDom = getBaseDom();
    const scrollDom = getScrollDom();

    if (!baseDom || !scrollDom) {
      console.warn('需要传入baseDom 和 scrollDom');
      return null;
    }

    const { offsetHeight: baseHeight, offsetWidth: baseWidth } = baseDom;

    const { totalHeightCount, totalWidthCount } = getScrollDomWidthAndHeight(
      scrollDom,
    );

    return (
      <ProcessBar
        barHandlerLen={
          direction === 'x'
            ? pxToBasePercent(baseWidth, totalWidthCount)
            : pxToBasePercent(baseHeight, totalHeightCount)
        }
        totalHeightCount={totalHeightCount}
        totalWidthCount={totalWidthCount}
        direction={direction}
        onScroll={this.handleScroll}
        onDidMount={this.handleBarDidMount}
      />
    );
  }
}
