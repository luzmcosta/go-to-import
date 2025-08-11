// Test file for library import navigation
// 📦 These are NPM package imports that should work with library navigation enabled:

import React from 'react';
import { useState } from 'react';
import axios from 'axios';
import lodash from 'lodash';
import _ from 'lodash';

// Scoped packages
import '@babel/core';
import { parser } from '@babel/parser';

// These should use local file resolution:
import './test-file.js';
import '../stores/api.js';
import config from './config.json';

// Path aliases (should work with vite config)
import apiStore from '@/stores/api.js';
import userStore from '@root/example/stores/user.js';

console.log('Testing library imports...');
