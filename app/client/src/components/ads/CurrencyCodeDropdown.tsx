import React from "react";
import styled from "styled-components";
import Dropdown, { DropdownOption } from "components/ads/Dropdown";
import { CurrencyTypeOptions, CurrencyOptionProps } from "constants/Currency";
import Icon, { IconSize } from "components/ads/Icon";
import { countryToFlag } from "components/designSystems/blueprint/InputComponent/utilties";

const DropdownTriggerIconWrapper = styled.div`
  height: 19px;
  padding: 9px 5px 9px 12px;
  width: 40px;
  height: 19px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  line-height: 19px;
  letter-spacing: -0.24px;
  color: #090707;
`;

const CurrencyIconWrapper = styled.span`
  height: 100%;
  padding: 6px 4px 6px 12px;
  width: 28px;
  position: absolute;
  left: 0;
  z-index: 16;
  font-size: 14px;
  line-height: 19px;
  letter-spacing: -0.24px;
  color: #090707;
`;

export const getCurrencyOptions = (): Array<DropdownOption> => {
  return CurrencyTypeOptions.map((item: CurrencyOptionProps) => {
    return {
      leftElement: countryToFlag(item.code),
      searchText: item.label,
      label: `${item.currency} - ${item.currency_name}`,
      value: item.currency,
    };
  });
};

export const getSelectedCurrency = (currencyType?: string): DropdownOption => {
  const selectedCurrency: CurrencyOptionProps | undefined = currencyType
    ? CurrencyTypeOptions.find((item: CurrencyOptionProps) => {
        return item.currency === currencyType;
      })
    : undefined;
  if (selectedCurrency) {
    return {
      label: `${selectedCurrency.currency} - ${selectedCurrency.currency_name}`,
      searchText: selectedCurrency.label,
      value: selectedCurrency.currency,
      id: selectedCurrency.symbol_native,
    };
  }
  return CurrencyTypeOptions[0];
};

interface CurrencyDropdownProps {
  onCurrencyTypeChange: (code?: string) => void;
  options: Array<DropdownOption>;
  selected: DropdownOption;
  allowCurrencyChange?: boolean;
}

export default function CurrencyTypeDropdown(props: CurrencyDropdownProps) {
  if (!props.allowCurrencyChange) {
    return (
      <CurrencyIconWrapper>
        {getSelectedCurrency(props.selected.value).id}
      </CurrencyIconWrapper>
    );
  }
  const dropdownTriggerIcon = (
    <DropdownTriggerIconWrapper className="t--input-currency-change">
      {getSelectedCurrency(props.selected.value).id}
      <Icon name="downArrow" size={IconSize.XXS} />
    </DropdownTriggerIconWrapper>
  );
  return (
    <Dropdown
      containerClassName="currency-type-filter"
      dropdownHeight="195px"
      dropdownTriggerIcon={dropdownTriggerIcon}
      enableSearch
      onSelect={props.onCurrencyTypeChange}
      optionWidth="260px"
      options={props.options}
      searchPlaceholder="Search by currency or country"
      selected={props.selected}
      showLabelOnly
    />
  );
}
