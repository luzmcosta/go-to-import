/**
 * @file AuthStore
 * @desc The AuthStore manages the user's authentication, authorization, and settings.
 * @module stores/auth
 * @store AuthStore
 * @doc auth
 */

/**
 * @section Dependencies
 */

/**
 * @section {h4} Libraries
 * @requires package:pinia
 * @requires package:vue
 */
import { defineStore, storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'

/**
 * @section {h4} Services
 * @requires firebase:fireauth
 * @requires firebase:firestore
 */
import {
  FireAuth,
  onFirebaseAuthStateChanged,
  setTenantIdOnFireauth,
  signInWithProvider as firebaseSignInWithProvider,
  signOutWithFirebase,
} from '@/firebase/fireauth.js'
import { getFirebaseDocument } from '@/firebase/firestore.js'

/**
 * @section {h4} Utilities
 * @requires utils:env
 */
import { ValidationError } from '@/utils/error.js'

/**
 * @section {h4} Stores
 * @requires store:UserStore
 */
import { useSettingStore } from '@/stores/setting.js'
import { useUserStore } from '@/stores/user'
import { useApiStore } from '@/stores/api'

/** @section {h4} Environment Variables */
import {
  DOMAIN_NAME,
  TENANT_ID,

  DOMAIN_NAME_FOR_ADOPS_TENANT,
  TENANT_ID_FOR_ADOPS_TENANT,

  DOMAIN_NAME_FOR_DEFAULT_TENANT,
  TENANT_ID_FOR_DEFAULT_TENANT,
} from '@/utils/env.js'
