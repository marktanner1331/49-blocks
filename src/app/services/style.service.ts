import { Injectable } from '@angular/core';

export class StyleSheet {
  private styleSheet: CSSStyleSheet;
  private headElement: HTMLHeadElement;
  private styleSheetElement: HTMLStyleElement;

  constructor() {
    this.headElement = document.getElementsByTagName("head")[0];

    // Create the style sheet element.
    this.styleSheetElement = document.createElement("style");
    this.styleSheetElement.type = "text/css";

    // Append the style sheet element to the head.
    this.headElement.appendChild(this.styleSheetElement);

    this.styleSheet = this.styleSheetElement.sheet as CSSStyleSheet;
  }

  public addKeyFrame(name: string, properties: string[]) {
    let rules: CSSRuleList = this.styleSheet.cssRules.length > 0 || this.styleSheet.rules.length == 0 ? this.styleSheet.cssRules : this.styleSheet.rules;
    let ruleIndex = this.styleSheet.insertRule("@keyframes " + name + "{ }", rules.length);

    let rule = rules[ruleIndex] as CSSStyleRule;
    let keyframe = rule! as CSSRule as CSSKeyframesRule;

    for (let property of properties) {
      keyframe.appendRule(property);
    }
  }

  public addClass(name: string, styles: { [styleName: string]: string }) {
    let rules: CSSRuleList = this.styleSheet.cssRules.length > 0 || this.styleSheet.rules.length == 0 ? this.styleSheet.cssRules : this.styleSheet.rules;
    let ruleIndex = this.styleSheet.insertRule(name + "{ }", rules.length);

    let rule = rules[ruleIndex] as CSSStyleRule;

    Object.keys(styles).forEach(styleName => {
      rule!.style.setProperty(styleName, styles[styleName]);
    });
  }

  destroy() {
    this.headElement.removeChild(this.styleSheetElement);
  }
}
