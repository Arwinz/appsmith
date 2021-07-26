import { ExecuteActionPayloadEvent } from "constants/AppsmithActionConstants/ActionConstants";
import { call, select } from "redux-saga/effects";
import {
  getCurrentApplicationId,
  getCurrentPageId,
  getPageList,
} from "selectors/editorSelectors";
import _ from "lodash";
import { Page } from "constants/ReduxActionConstants";
import AnalyticsUtil from "utils/AnalyticsUtil";
import { getAppMode } from "selectors/applicationSelectors";
import { APP_MODE } from "reducers/entityReducers/appReducer";
import {
  BUILDER_PAGE_URL,
  convertToQueryParams,
  getApplicationViewerPageURL,
} from "constants/routes";
import history from "utils/history";
import { setDataUrl } from "sagas/PageSagas";
import AppsmithConsole from "utils/AppsmithConsole";
import { NavigateActionDescription } from "entities/DataTree/actionTriggers";

export enum NavigationTargetType {
  SAME_WINDOW = "SAME_WINDOW",
  NEW_WINDOW = "NEW_WINDOW",
}

const isValidUrlScheme = (url: string): boolean => {
  return (
    // Standard http call
    url.startsWith("http://") ||
    // Secure http call
    url.startsWith("https://") ||
    // Mail url to directly open email app prefilled
    url.startsWith("mailto:") ||
    // Tel url to directly open phone app prefilled
    url.startsWith("tel:")
  );
};

export default function* navigateActionSaga(
  action: NavigateActionDescription["payload"],
  event: ExecuteActionPayloadEvent,
) {
  const pageList = yield select(getPageList);
  const applicationId = yield select(getCurrentApplicationId);
  const {
    pageNameOrUrl,
    params,
    target = NavigationTargetType.SAME_WINDOW,
  } = action;
  const page = _.find(
    pageList,
    (page: Page) => page.pageName === pageNameOrUrl,
  );
  if (page) {
    const currentPageId = yield select(getCurrentPageId);
    AnalyticsUtil.logEvent("NAVIGATE", {
      pageName: pageNameOrUrl,
      pageParams: params,
    });
    const appMode = yield select(getAppMode);
    const path =
      appMode === APP_MODE.EDIT
        ? BUILDER_PAGE_URL(applicationId, page.pageId, params)
        : getApplicationViewerPageURL(applicationId, page.pageId, params);
    if (target === NavigationTargetType.SAME_WINDOW) {
      history.push(path);
      if (currentPageId === page.pageId) {
        yield call(setDataUrl);
      }
    } else if (target === NavigationTargetType.NEW_WINDOW) {
      window.open(path, "_blank");
    }

    AppsmithConsole.info({
      text: `navigateTo('${page.pageName}') was triggered`,
      state: {
        params,
      },
    });
    if (event.callback) event.callback({ success: true });
  } else {
    AnalyticsUtil.logEvent("NAVIGATE", {
      navUrl: pageNameOrUrl,
    });
    let url = pageNameOrUrl + convertToQueryParams(params);
    // Add a default protocol if it doesn't exist.
    if (!isValidUrlScheme(url)) {
      url = "https://" + url;
    }
    if (target === NavigationTargetType.SAME_WINDOW) {
      window.location.assign(url);
    } else if (target === NavigationTargetType.NEW_WINDOW) {
      window.open(url, "_blank");
    }
    if (event.callback) event.callback({ success: true });
  }
}
