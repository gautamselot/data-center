'use strict';
// /api/state: everything the screens need, shaped for the signed-in role (see src/state.js).
const {state}=require('../state');
const {route}=require('../router');
route('GET','/api/state','any',u=>state(u));
