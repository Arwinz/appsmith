import React, { useEffect, useRef, useContext, useMemo } from "react";
import { useSelector } from "react-redux";
import { Highlight as AlgoliaHighlight } from "react-instantsearch-dom";
import { Hit as IHit } from "react-instantsearch-core";
import styled, { withTheme } from "styled-components";
import {
  Theme,
  getTypographyByKey,
  scrollbarDark,
} from "constants/DefaultTheme";
import Highlight from "./Highlight";
import ActionLink, { StyledActionLink } from "./ActionLink";
import scrollIntoView from "scroll-into-view-if-needed";
import { getItemType, getItemTitle, SEARCH_ITEM_TYPES } from "./utils";
import SearchContext from "./GlobalSearchContext";
import {
  getWidgetIcon,
  getPluginIcon,
} from "pages/Editor/Explorer/ExplorerIcons";
import { HelpIcons } from "icons/HelpIcons";
import { getActionConfig } from "pages/Editor/Explorer/Actions/helpers";
import { AppState } from "reducers";
import { keyBy } from "lodash";

const DocumentIcon = HelpIcons.DOCUMENT;

type ItemProps = {
  item: IHit | any;
  index: number;
  theme: Theme;
  query: string;
};

export const SearchItemContainer = styled.div<{ isActiveItem: boolean }>`
  ${(props) => getTypographyByKey(props, "p3")};
  [class^="ais-"] {
    ${(props) => getTypographyByKey(props, "p3")};
  }
  background-color: ${(props) =>
    props.isActiveItem
      ? props.theme.colors.globalSearch.activeSearchItemBackground
      : "unset"};
  &:hover {
    background-color: ${(props) =>
      props.theme.colors.globalSearch.activeSearchItemBackground};
  }
  display: flex;
  padding: ${(props) =>
    `${props.theme.spaces[3]}px ${props.theme.spaces[4]}px`};
  border-radius: ${(props) => props.theme.radii[2]}px;
  color: ${(props) => props.theme.colors.globalSearch.searchItemText};
  & .ais-Highlight-highlighted,
  & .search-highlighted {
    background: unset;
    color: ${(props) => props.theme.colors.globalSearch.searchItemHighlight};
    font-style: normal;
    text-decoration: underline;
    text-decoration-color: ${(props) =>
      props.theme.colors.globalSearch.highlightedTextUnderline};
  }
  &:hover ${StyledActionLink} {
    visibility: visible;
  }
`;

const ItemTitle = styled.div`
  margin-left: ${(props) => props.theme.spaces[5]}px;
  display: flex;
  justify-content: space-between;
  flex: 1;
  align-items: center;
`;

const StyledDocumentIcon = styled(DocumentIcon)`
  svg {
    width: 12px;
    height: 12px;
    path {
      fill: transparent;
    }
  }
`;

const DocumentationItem = withTheme((props: any) => {
  const searchContext = useContext(SearchContext);
  return (
    <>
      <span onClick={() => searchContext.handleItemLinkClick(props.item)}>
        <StyledDocumentIcon />
      </span>
      <ItemTitle>
        <span>
          <AlgoliaHighlight attribute="title" hit={props.item} />
        </span>
        <ActionLink item={props.item} isActiveItem={props.isActiveItem} />
      </ItemTitle>
    </>
  );
});

const WidgetItem = withTheme((props: any) => {
  const { query, item } = props;
  const { type } = item || {};
  const searchContext = useContext(SearchContext);
  const title = getItemTitle(item);

  return (
    <>
      <span onClick={() => searchContext.handleItemLinkClick(props.item)}>
        {getWidgetIcon(type)}
      </span>
      <ItemTitle>
        <Highlight match={query} text={title} />
        <ActionLink item={props.item} isActiveItem={props.isActiveItem} />
      </ItemTitle>
    </>
  );
});

const ActionItem = withTheme((props: any) => {
  const { item, query } = props;
  const { config } = item || {};
  const title = getItemTitle(item);
  const searchContext = useContext(SearchContext);
  const { pluginType } = config;
  const plugins = useSelector((state: AppState) => {
    return state.entities.plugins.list;
  });
  const pluginGroups = useMemo(() => keyBy(plugins, "id"), [plugins]);
  const icon = getActionConfig(pluginType)?.getIcon(
    item.config,
    pluginGroups[item.config.datasource.pluginId],
  );
  return (
    <>
      <span onClick={() => searchContext.handleItemLinkClick(props.item)}>
        {icon}
      </span>
      <ItemTitle>
        <Highlight match={query} text={title} />
        <ActionLink item={props.item} isActiveItem={props.isActiveItem} />
      </ItemTitle>
    </>
  );
});

const DatasourceItem = withTheme((props: any) => {
  const searchContext = useContext(SearchContext);
  const { item, query } = props;
  const plugins = useSelector((state: AppState) => {
    return state.entities.plugins.list;
  });
  const pluginGroups = useMemo(() => keyBy(plugins, "id"), [plugins]);
  const icon = getPluginIcon(pluginGroups[item.pluginId]);
  const title = getItemTitle(item);

  return (
    <>
      <span onClick={() => searchContext.handleItemLinkClick(props.item)}>
        {icon}
      </span>
      <ItemTitle>
        <Highlight match={query} text={title} />
        <ActionLink item={props.item} isActiveItem={props.isActiveItem} />
      </ItemTitle>
    </>
  );
});

const SearchItemByType = {
  [SEARCH_ITEM_TYPES.documentation]: DocumentationItem,
  [SEARCH_ITEM_TYPES.widget]: WidgetItem,
  [SEARCH_ITEM_TYPES.action]: ActionItem,
  [SEARCH_ITEM_TYPES.datasource]: DatasourceItem,
};

const SearchItem = withTheme((props: ItemProps) => {
  const { item, index, query } = props;
  const itemRef = useRef<HTMLDivElement>(null);
  const { activeItemIndex } = useContext(SearchContext);
  const isActiveItem = activeItemIndex === index;

  useEffect(() => {
    if (isActiveItem && itemRef.current) {
      scrollIntoView(itemRef.current, { scrollMode: "if-needed" });
    }
  }, [isActiveItem]);

  const itemType = getItemType(item);
  const Item = SearchItemByType[itemType];
  const { setActiveItemIndex } = useContext(SearchContext);

  return (
    <SearchItemContainer
      ref={itemRef}
      onClick={() => setActiveItemIndex(index)}
      className="t--docHit"
      isActiveItem={isActiveItem}
    >
      <Item hit={item} item={item} query={query} isActiveItem={isActiveItem} />
    </SearchItemContainer>
  );
});

const SearchResultsContainer = styled.div`
  padding: 0 ${(props) => props.theme.spaces[6]}px;
  overflow: auto;
  width: 250px;
  ${scrollbarDark}
`;

const SearchResults = ({
  searchResults,
  query,
}: {
  searchResults: any[];
  query: string;
}) => {
  return (
    <SearchResultsContainer>
      {searchResults.map((item: any, index: number) => (
        <SearchItem key={index} index={index} item={item} query={query} />
      ))}
    </SearchResultsContainer>
  );
};

export default SearchResults;
