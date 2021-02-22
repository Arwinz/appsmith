import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { connectSearchBox } from "react-instantsearch-dom";
import { SearchBoxProvided } from "react-instantsearch-core";
import { getTypographyByKey } from "constants/DefaultTheme";
import Icon from "components/ads/Icon";
import { AppState } from "reducers";
import { OMNIBAR_PLACEHOLDER } from "constants/messages";

const Separator = styled.div`
  height: 1px;
  background: ${(props) => props.theme.colors.globalSearch.separator};
  width: 100%;
`;

const Container = styled.div`
  padding: ${(props) => `0 ${props.theme.spaces[11]}px`};
  & input {
    ${(props) => getTypographyByKey(props, "cardSubheader")}
    background: transparent;
    color: ${(props) => props.theme.colors.globalSearch.searchInputText};
    border: none;
    padding: ${(props) => `${props.theme.spaces[7]}px 0`};
    flex: 1;
  }
`;

const InputContainer = styled.div`
  display: flex;
`;

const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.keyCode === 38 || e.key === "ArrowUp") {
    e.preventDefault();
  }
};

type SearchBoxProps = SearchBoxProvided & {
  query: string;
  setQuery: (query: string) => void;
};

const SearchBox = ({ query, setQuery }: SearchBoxProps) => {
  const [listenToChange, setListenToChange] = useState(false);
  const { modalOpen } = useSelector((state: AppState) => state.ui.globalSearch);
  const updateSearchQuery = useCallback(
    (query) => {
      // to prevent key combo to open modal from trigging query update
      if (!listenToChange) return;
      setQuery(query);
    },
    [listenToChange],
  );

  useEffect(() => {
    let timer: number;
    if (modalOpen) {
      timer = setTimeout(() => setListenToChange(true), 100);
    }

    return () => {
      if (timer) clearTimeout(timer);
      setListenToChange(false);
    };
  }, [modalOpen]);

  return (
    <Container>
      <InputContainer>
        <input
          value={query}
          onChange={(e) => updateSearchQuery(e.currentTarget.value)}
          autoFocus
          onKeyDown={handleKeyDown}
          placeholder={OMNIBAR_PLACEHOLDER}
        />
        {query && <Icon name="close" onClick={() => updateSearchQuery("")} />}
      </InputContainer>
      <Separator />
    </Container>
  );
};

export default connectSearchBox<SearchBoxProps>(SearchBox);
