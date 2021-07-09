import React from "react";
import BaseWidget, { WidgetProps, WidgetState } from "./BaseWidget";
import { WidgetType } from "constants/WidgetConstants";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import { isArray } from "lodash";
import { VALIDATION_TYPES } from "constants/WidgetValidation";
import * as Sentry from "@sentry/react";
import withMeta, { WithMeta } from "./MetaHOC";
import { EvaluationSubstitutionType } from "entities/DataTree/dataTreeFactory";
import MultiSelectComponent from "components/designSystems/appsmith/MultiSelectComponent";
import { DefaultValueType } from "rc-select/lib/interface/generator";
import { Layers } from "constants/Layers";

class MultiSelectWidget extends BaseWidget<
  MultiSelectWidgetProps,
  WidgetState
> {
  static getPropertyPaneConfig() {
    return [
      {
        sectionName: "General",
        children: [
          {
            helpText: "Controls the Remote Data/ Server Side Filtering",
            propertyName: "serverSideFiltering",
            label: "Server Side Filtering",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: VALIDATION_TYPES.BOOLEAN,
          },
          {
            helpText: "Filter options using filterText",
            hidden: (props: MultiSelectWidgetProps) =>
              !props.serverSideFiltering,
            propertyName: "onFilterUpdate",
            label: "onFilterUpdate",
            controlType: "INPUT_TEXT",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: VALIDATION_TYPES.OPTIONS_DATA,
            evaluationSubstitutionType:
              EvaluationSubstitutionType.SMART_SUBSTITUTE,
          },
          {
            helpText:
              "Allows users to select multiple options. Values must be unique",
            propertyName: "options",
            label: "Options",
            controlType: "INPUT_TEXT",
            placeholderText: "Enter option value",
            isBindProperty: true,
            isTriggerProperty: false,
            isJSConvertible: true,
            validation: VALIDATION_TYPES.OPTIONS_DATA,
            evaluationSubstitutionType:
              EvaluationSubstitutionType.SMART_SUBSTITUTE,
          },
          {
            helpText: "Selects the option with value by default",
            propertyName: "defaultOptionValue",
            label: "Default Value",
            controlType: "INPUT_TEXT",
            placeholderText: "Enter option value",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: VALIDATION_TYPES.DEFAULT_OPTION_VALUES,
          },
          {
            helpText: "Input Place Holder",
            propertyName: "placeholderText",
            label: "Placeholder",
            controlType: "INPUT_TEXT",
            placeholderText: "Enter placeholder text",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: VALIDATION_TYPES.TEXT,
          },
          {
            propertyName: "isRequired",
            label: "Required",
            helpText: "Makes input to the widget mandatory",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: VALIDATION_TYPES.BOOLEAN,
          },
          {
            helpText: "Controls the visibility of the widget",
            propertyName: "isVisible",
            label: "Visible",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: VALIDATION_TYPES.BOOLEAN,
          },
          {
            propertyName: "isDisabled",
            label: "Disabled",
            helpText: "Disables input to this widget",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: VALIDATION_TYPES.BOOLEAN,
          },
        ],
      },
      {
        sectionName: "Actions",
        children: [
          {
            helpText: "Triggers an action when a user selects an option",
            propertyName: "onOptionChange",
            label: "onOptionChange",
            controlType: "ACTION_SELECTOR",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: true,
          },
        ],
      },
    ];
  }

  static getDerivedPropertiesMap() {
    return {
      selectedIndexArr: `{{ this.selectedOptionValues.map(o => _.findIndex(this.options, { value: o })) }}`,
      selectedOptionLabels: `{{ this.selectedOptionValueArr.map((o) => { const index = _.findIndex(this.options, { value: o }); return this.options[index]?.label ?? this.options[index]?.value; })  }}`,
      selectedOptionValues: `{{ this.selectedOptionValueArr.filter((o) => { const index = _.findIndex(this.options, { value: o });  return index > -1; })  }}`,
      isValid: `{{this.isRequired ? !!this.selectedIndexArr && this.selectedIndexArr.length > 0 : true}}`,
    };
  }

  static getDefaultPropertiesMap(): Record<string, string> {
    return {
      selectedOptionValueArr: "defaultOptionValue",
      filterText: "",
    };
  }

  static getMetaPropertiesMap(): Record<string, any> {
    return {
      selectedOptionValueArr: undefined,
      filterText: "",
    };
  }

  getPageView() {
    let options;
    if (this.props.serverSideFiltering && this.props.filterText?.length) {
      options = isArray(this.props.onFilterUpdate)
        ? this.props.onFilterUpdate
        : [];
    } else {
      options = isArray(this.props.options) ? this.props.options : [];
    }
    const values: string[] = isArray(this.props.selectedOptionValues)
      ? this.props.selectedOptionValues
      : [];
    console.log(values, "valuesvaluevaluess");
    return (
      <MultiSelectComponent
        disabled={this.props.isDisabled ?? false}
        dropdownStyle={{
          zIndex: Layers.dropdownModalWidget,
        }}
        loading={this.props.isLoading}
        onChange={this.onOptionChange}
        onFilterChange={this.onFilterChange}
        options={options}
        placeholder={this.props.placeholderText as string}
        serverSideFiltering={this.props.serverSideFiltering}
        value={values}
      />
    );
  }

  onOptionChange = (value: DefaultValueType) => {
    console.log(value, "Selected");

    this.props.updateWidgetMetaProperty("selectedOptionValueArr", value, {
      triggerPropertyName: "onOptionChange",
      dynamicString: this.props.onOptionChange,
      event: {
        type: EventType.ON_OPTION_CHANGE,
      },
    });

    // Empty filter after Selection
    this.onFilterChange("");
  };

  onFilterChange = (value: string) => {
    this.props.updateWidgetMetaProperty("filterText", value, {
      triggerPropertyName: "onOptionChange",
      dynamicString: this.props.onFilterChange,
      event: {
        type: EventType.ON_FILTER_CHANGE,
      },
    });
  };

  getWidgetType(): WidgetType {
    return "MULTI_SELECT_WIDGET";
  }
}

export interface DropdownOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface MultiSelectWidgetProps extends WidgetProps, WithMeta {
  placeholderText?: string;
  selectedIndex?: number;
  selectedIndexArr?: number[];
  selectedOption: DropdownOption;
  options?: DropdownOption[];
  onOptionChange: string;
  onFilterChange: string;
  defaultOptionValue: string | string[];
  isRequired: boolean;
  isLoading: boolean;
  selectedOptionValueArr: string[];
  filterText?: string;
  selectedOptionValues: string[];
  selectedOptionLabels: string[];
  serverSideFiltering: boolean;
  onFilterUpdate?: DropdownOption[];
}

export default MultiSelectWidget;
export const ProfiledMultiSelectWidget = Sentry.withProfiler(
  withMeta(MultiSelectWidget),
);
