import 'core-js/stable'
import 'regenerator-runtime/runtime'
import './types/modules.d'

if (__PRODUCTION__) {
  __webpack_public_path__ = window.__ACTION__.publicPath
}
