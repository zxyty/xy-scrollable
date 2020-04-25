export const pxToBasePercent = (baseWidth, currentWidth) => {
  if (!baseWidth || currentWidth < baseWidth) {
    return '100%';
  }

  return `${parseInt(
    `${(Number(baseWidth) / Number(currentWidth)) * 100}`,
    10,
  )}%`;
};

export const getScrollTotalHeightAndWidth = (scrollDom: HTMLElement) => {
  // const { children = [] } = scrollDom;
  // let totalWidthCount = 0;
  // let totalHeightCount = 0;
  // for (let i = 0; i < children.length; i += 1) {
  //   totalWidthCount += (children[i] as HTMLElement).offsetWidth!;
  //   totalHeightCount += (children[i] as HTMLElement).offsetHeight!;
  // }

  // default get current scroll dom width & height
  const {
    width: totalWidthCount,
    height: totalHeightCount,
  } = scrollDom.getBoundingClientRect();

  return { totalWidthCount, totalHeightCount };
};
