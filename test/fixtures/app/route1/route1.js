import angular from 'angular';

import App from '../app';
import Util from '../common/util';

export default class Route1 {
  constructor() {
    console.log('route1');
    angular.module('myModule', []);
  }
};
