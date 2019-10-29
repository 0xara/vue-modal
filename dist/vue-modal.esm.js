import { addStyle, removeStyle } from 'js-helpers/dist/element/style';
import { getWidth } from 'js-helpers/dist/element/dims';
import { addListener } from 'js-helpers/dist/element/event';
import { is } from 'js-helpers/dist/element/is';

//

var script = {

    inheritAttrs: false,

    props: {
        show: {},
        strict: {},
        name: {},
        allowToClose: {},
        containerStyle: { default: function _default() {} },
        size: { default: 'md' },
        center: { default: false },
        closeButton: { type: Boolean, default: true },
        transitionType: { default: 'modal' },
        portal: { default: 'modals' },
        scroll: { default: true }
    },

    data: function data() {
        return {
            modal_name: ''
        };
    },


    computed: {
        containerClass: function containerClass() {
            return ['modal-' + this.size, { 'modal-center': this.center }];
        },
        maskStyle: function maskStyle() {
            if (this.scroll) return {};
            return { overflow: 'hidden' };
        },
        transition: function transition() {
            if (this.center) return 'modal-fade';
            return this.transitionType;
        }
    },

    watch: {
        show: function show(nVal, oldVal) {
            if (nVal) {
                this.$bus.$emit((this.modal_name ? this.modal_name + '-' : '') + 'modal-opened');
                this.$nextTick(function () {
                    addStyle('body', { overflow: 'hidden', 'margin-right': window.innerWidth - getWidth('body') + 'px' });
                });
            } else {
                this.$bus.$emit((this.modal_name ? this.modal_name + '-' : '') + 'modal-closed');
                this.$nextTick(function () {
                    removeStyle('body', { overflow: '', 'margin-right': '' });
                });
            }
        }
    },

    created: function created() {
        this.modal_name = this.name ? this.name : '';
    },
    mounted: function mounted() {
        this.$nextTick(function () {
            this.handleEvents();
            this.handleCloseEvents();
        });
    },


    methods: {
        handleEvents: function handleEvents() {
            if (!this.modal_name) return;

            var self = this;

            this.$bus.$on('change-' + this.modal_name + '-modal-state', function (state) {
                if (state) {
                    self.handleShowModal();
                } else {
                    self.handleHideModal();
                }
            });
        },
        handleCloseEvents: function handleCloseEvents() {
            if (this.strict) return;

            var self = this;

            addListener(document, 'keydown', function (e) {
                if (self.hasAllowToCloseNow()) {
                    if (e.keyCode == 27) {
                        self.handleHideModal();
                        self.$bus.$emit((self.modal_name ? self.modal_name + '-' : '') + 'modal-closed');
                    }
                }
            });

            addListener(document, 'click touchstart', function (e) {
                if (self.show && (is(e.target, '.modal-mask') || is(e.target, '.modal-wrapper'))) {
                    if (self.hasAllowToCloseNow()) {
                        self.handleHideModal();
                        self.$bus.$emit((self.modal_name ? self.modal_name + '-' : '') + 'modal-closed');
                    }
                }
            });
        },
        hasAllowToCloseNow: function hasAllowToCloseNow() {
            return this.allowToClose;
        },
        handleHideModal: function handleHideModal() {
            this.$emit('hide-modal');
        },
        handleShowModal: function handleShowModal() {
            this.$emit('show-modal');
        }
    }
};

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css = ".modal-mask{position:fixed;z-index:9998;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,.5);display:block;-webkit-transition:opacity .3s ease;transition:opacity .3s ease;overflow-x:hidden;overflow-y:auto}.modal-wrapper{display:block;vertical-align:middle;padding-top:30px}.modal-container{position:relative;margin:auto;border-radius:2px;-webkit-box-shadow:0 2px 8px rgba(0,0,0,.33);box-shadow:0 2px 8px rgba(0,0,0,.33);-webkit-transition:all .3s ease;transition:all .3s ease;width:90%}.modal-container.modal-center{position:fixed;left:50%;top:50%;-webkit-transform:translate(-50%,-50%);transform:translate(-50%,-50%)}@media (min-width:768px){.modal-container{width:600px;margin:auto;border-radius:6px}}@media (min-width:992px){.modal-container.modal-md{width:900px}.modal-container.modal-lg{width:900px}}@media (min-width:1200px){.modal-container.modal-lg{width:1180px}}.modal-header{border-radius:5px 5px 0 0}.modal-header h3{padding:18px 14px;margin:0;font-size:18px;color:inherit}.modal-body{width:100%;height:100%;padding:20px 30px;background-color:#fff}.modal-default-button{float:right}.modal-close{position:absolute;top:10px;left:10px}.modal-fade-enter,.modal-fade-leave-to{opacity:0}.modal-fade-enter-active,.modal-fade-leave-active{-webkit-transition:opacity .3s ease;transition:opacity .3s ease}.modal-enter,.modal-leave-to{opacity:0}.modal-enter-active,.modal-leave-active{-webkit-transition:opacity .3s ease;transition:opacity .3s ease}.modal-enter .modal-container{-webkit-transform:translate(0,-25%);transform:translate(0,-25%);-webkit-transition:-webkit-transform .3s ease-out;transition:-webkit-transform .3s ease-out;transition:transform .3s ease-out;transition:transform .3s ease-out, -webkit-transform .3s ease-out}.modal-leave-to .modal-container{-webkit-transform:translate(0,-25%);transform:translate(0,-25%);-webkit-transition:-webkit-transform .3s ease-in;transition:-webkit-transform .3s ease-in;transition:transform .3s ease-in;transition:transform .3s ease-in, -webkit-transform .3s ease-in}.modal-enter-active .modal-container,.modal-leave-active .modal-container{-webkit-transition:1s;transition:1s}";
styleInject(css);

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier
/* server only */
, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
  if (typeof shadowMode !== 'boolean') {
    createInjectorSSR = createInjector;
    createInjector = shadowMode;
    shadowMode = false;
  } // Vue.extend constructor export interop.


  var options = typeof script === 'function' ? script.options : script; // render functions

  if (template && template.render) {
    options.render = template.render;
    options.staticRenderFns = template.staticRenderFns;
    options._compiled = true; // functional template

    if (isFunctionalTemplate) {
      options.functional = true;
    }
  } // scopedId


  if (scopeId) {
    options._scopeId = scopeId;
  }

  var hook;

  if (moduleIdentifier) {
    // server build
    hook = function hook(context) {
      // 2.3 injection
      context = context || // cached call
      this.$vnode && this.$vnode.ssrContext || // stateful
      this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext; // functional
      // 2.2 with runInNewContext: true

      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__;
      } // inject component styles


      if (style) {
        style.call(this, createInjectorSSR(context));
      } // register component module identifier for async chunk inference


      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier);
      }
    }; // used by ssr in case component is cached and beforeCreate
    // never gets called


    options._ssrRegister = hook;
  } else if (style) {
    hook = shadowMode ? function () {
      style.call(this, createInjectorShadow(this.$root.$options.shadowRoot));
    } : function (context) {
      style.call(this, createInjector(context));
    };
  }

  if (hook) {
    if (options.functional) {
      // register for functional component in vue file
      var originalRender = options.render;

      options.render = function renderWithStyleInjection(h, context) {
        hook.call(context);
        return originalRender(h, context);
      };
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate;
      options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
    }
  }

  return script;
}

var normalizeComponent_1 = normalizeComponent;

/* script */
var __vue_script__ = script;
/* template */
var __vue_render__ = function __vue_render__() {
  var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('portal', { attrs: { "to": _vm.portal } }, [_c('transition', { attrs: { "name": _vm.transition } }, [_c('div', _vm._b({ directives: [{ name: "show", rawName: "v-show", value: _vm.show, expression: "show" }], staticClass: "modal-mask", class: { zIndexHigh: _vm.strict == 1 }, staticStyle: { "display": "none" }, style: _vm.maskStyle, attrs: { "transition": _vm.transition } }, 'div', _vm.$attrs, false), [_c('div', { staticClass: "modal-wrapper" }, [_c('div', { staticClass: "modal-container", class: _vm.containerClass, style: _vm.containerStyle }, [_vm.closeButton ? _c('a', { staticClass: "modal-close close", on: { "click": function click($event) {
        $event.stopPropagation();$event.preventDefault();return _vm.handleHideModal($event);
      } } }, [_c('i', { staticClass: "fa fa-close" })]) : _vm._e(), _vm._v(" "), _c('div', { staticClass: "modal-header" }, [_vm._t("header")], 2), _vm._v(" "), _c('div', { staticClass: "modal-body container-full" }, [_vm._t("body")], 2), _vm._v(" "), _c('div', { staticClass: "modal-footer" }, [_vm._t("footer")], 2)])])])])], 1);
};
var __vue_staticRenderFns__ = [];

/* style */
var __vue_inject_styles__ = undefined;
/* scoped */
var __vue_scope_id__ = undefined;
/* module identifier */
var __vue_module_identifier__ = undefined;
/* functional template */
var __vue_is_functional_template__ = false;
/* style inject */

/* style inject SSR */

var Modal = normalizeComponent_1({ render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ }, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, undefined, undefined);

// install function executed by Vue.use()
function install(Vue) {
  if (install.installed) return;
  install.installed = true;
  Vue.component(Modal.name, Modal);
}

// Create module definition for Vue.use()
var plugin = {
  install: install

  // To auto-install when vue is found
  /* global window global */
};var GlobalVue = null;
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}
if (GlobalVue) {
  GlobalVue.use(plugin);
}

// Inject install function into component - allows component
// to be registered via Vue.use() as well as Vue.component()
Modal.install = install;

// It's possible to expose named exports when writing components that can
// also be used as directives, etc. - eg. import { RollupDemoDirective } from 'rollup-demo';
// export const RollupDemoDirective = component;

export default Modal;
