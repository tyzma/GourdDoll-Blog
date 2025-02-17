import type {
  RouteLocationNormalized,
  RouteRecordNormalized,
} from "vue-router";
import type { App, Plugin } from "vue";

import { unref } from "vue";

export const noop = () => {};

/**
 * @description:  Set ui mount node
 */
export function getPopupContainer(node?: HTMLElement): HTMLElement {
  return (node?.parentNode as HTMLElement) ?? document.body;
}

/**
 * Add the object as a parameter to the URL
 * @param baseUrl url
 * @param obj
 * @returns {string}
 * eg:
 *  let obj = {a: '3', b: '4'}
 *  setObjToUrlParams('www.baidu.com', obj)
 *  ==>www.baidu.com?a=3&b=4
 */
export function setObjToUrlParams(baseUrl: string, obj: any): string {
  let parameters = "";
  for (const key in obj) {
    parameters += key + "=" + encodeURIComponent(obj[key]) + "&";
  }
  parameters = parameters.replace(/&$/, "");
  return /\?$/.test(baseUrl)
    ? baseUrl + parameters
    : baseUrl.replace(/\/?$/, "?") + parameters;
}

export function getRawRoute(
  route: RouteLocationNormalized
): RouteLocationNormalized {
  if (!route) return route;
  const { matched, ...opt } = route;
  return {
    ...opt,
    matched: (matched
      ? matched.map((item) => ({
          meta: item.meta,
          name: item.name,
          path: item.path,
        }))
      : undefined) as RouteRecordNormalized[],
  };
}

export const withInstall = <T>(component: T, alias?: string) => {
  const comp = component as any;
  comp.install = (app: App) => {
    app.component(comp.name || comp.displayName, component);
    if (alias) {
      app.config.globalProperties[alias] = component;
    }
  };
  return component as T & Plugin;
};

/**
 * 打开一个窗口。该方法打开的窗口理论上不会被浏览器拦截
 * @param {url} string 要跳转的地址
 * @param {target} string 规定在何处打开链接文档。默认：'_blank'
 */
export function openWindow(url: any, target: any = "_blank") {
  const downloadElement = document.createElement("a");
  downloadElement.target = target;
  downloadElement.href = url;
  document.body.appendChild(downloadElement);
  downloadElement.click();
  document.body.removeChild(downloadElement);
}

/**
 * 下载文件
 * @param {any} urlObj 要下载的地址 或者 Blob对象
 * @param {any} saveName 文件保存的名字 可选参数
 */
export function openDownloadFile(urlObj: any, saveName: any) {
  const openDownload = function (href: any, fileName: any) {
    const downloadElement = document.createElement("a");
    downloadElement.target = "_blank";
    downloadElement.href = href;
    downloadElement.download = fileName || ""; // HTML5新增的属性，指定保存文件名，可以不要后缀
    document.body.appendChild(downloadElement);
    downloadElement.click(); // 点击下载
    document.body.removeChild(downloadElement); // 下载完成移除元素
  };

  if (typeof urlObj == "object" && urlObj instanceof Blob) {
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      //针对于IE浏览器的处理, 因部分IE浏览器不支持createObjectURL
      window.navigator.msSaveOrOpenBlob(urlObj, saveName);
    } else {
      const url = window.URL.createObjectURL(urlObj); // 创建blob地址
      openDownload(url, saveName);
      window.URL.revokeObjectURL(url); // 释放掉blob对象创建的地址
    }
  } else {
    openDownload(urlObj, saveName);
  }
}

/**
 * 判断是否是url
 * @param url 地址
 */
export function isUrl(url: any) {
  if (url) {
    const u = (url as string).toLowerCase();
    return u.startsWith("http:") || u.startsWith("https:");
  }
  return false;
}

/**
 * 防抖
 * @param fn 需要执行的函数
 * @param delay 间隔毫秒
 */
export function debounce(fn: any, delay: number) {
  let valid = false;
  let timer: any;
  return function (...args: any) {
    if (valid) {
      clearTimeout(timer);
    }
    const exeFun = () => fn.apply(this, args);
    timer = setTimeout(exeFun, delay);
    valid = true;
  };
}

/**
 * 节流
 * @param fn 需要执行的函数
 * @param delay 间隔毫秒
 */
export function throttle(fn: any, delay: number) {
  let valid = false;
  return function (...args: any) {
    if (valid) {
      return;
    }
    valid = true;
    const exeFun = () => {
      fn.apply(this, args);
      valid = false;
    };
    setTimeout(exeFun, delay);
  };
}
