<style lang="scss" type="text/scss">
    .modal-mask {
        position: fixed;
        z-index: 9998;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: block;
        transition: opacity .3s ease;
        overflow-x: hidden;
        overflow-y: auto;
    }

    .modal-wrapper {
        display: block;
        vertical-align: middle;
        //min-width: 1200px;
        padding-top: 30px;
        height: 100%;
    }

    .modal-container {
        position: relative;
        //width: auto;
        margin: auto;
        transition: all .3s ease;
        width: 90%;
        //font-family: Helvetica, Arial, sans-serif;

      &.modal-center{
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%,-50%);
      }
    }

    // Scale up the modal
    @media (min-width: 768px) {
        // Automatically set modal's width for larger viewports
        .modal-container {
            width: 600px;
            margin: auto;
            border-radius: 6px;
        }
        .modal-content {
            //@include box-shadow(0 5px 15px rgba(0,0,0,.5));
        }

        // Modal sizes
        //.modal-sm { width: $modal-sm; }
    }

    @media (min-width: 992px) {
        .modal-container.modal-md { width: 900px; }
        .modal-container.modal-lg { width: 900px; }
    }

    @media (min-width: 1200px) {
      .modal-container.modal-lg { width: 1180px; }
    }

    .modal-header {
      border-radius: 5px 5px 0 0;
    }

    .modal-header h3 {
        padding: 18px 14px;
        margin: 0;
        font-size: 18px;
        color: inherit;
    }

    .modal-body {
        width: 100%;
        height: 100%;
        padding: 20px 30px;
        background-color: #fff;
    }

    .modal-default-button {
        float: right;
    }

    .modal-close {
        position: absolute;
        top: 10px;
        left: 10px;
    }

    /*
     * the following styles are auto-applied to elements with
     * v-transition="modal" when their visiblity is toggled
     * by Vue.js.
     *
     * You can easily play with the modal transition by editing
     * these styles.
     */

    .modal-fade-enter, .modal-fade-leave-to {
      opacity: 0;
    }

    .modal-fade-enter-active, .modal-fade-leave-active {
      transition: opacity .3s ease;
    }

    .modal-enter, .modal-leave-to {
        opacity: 0;
    }

    .modal-enter-active, .modal-leave-active {
        transition: opacity .3s ease;
    }

    .modal-enter .modal-container {
        transform: translate(0, -25%);
        transition: transform 0.3s ease-out;
    }

    .modal-leave-to .modal-container {
        transform: translate(0, -25%);
        transition: transform 0.3s ease-in;
    }

    .modal-leave-active .modal-container,
    .modal-enter-active .modal-container{
        transition: 1s;
    }

</style>

<template>
  <portal :to="portal">
    <transition :name="transition">
      <div
        v-show="show || show_modal"
        v-bind="$attrs"
        :style="maskStyles"
        :class="{ zIndexHigh:strict==1 }"
        :transition="transition"
        class="modal-mask"
        style="display: none">
        <div class="modal-wrapper">
          <div
            :style="containerStyle"
            :class="containerClass"
            class="modal-container">
            <a
              v-if="closeButton"
              class="modal-close close"
              @click.stop.prevent="handleHideModal">
              <i class="fa fa-close"></i>
            </a>
            <slot></slot>
            <div class="modal-header" v-if="this.$slots.header">
              <slot name="header"></slot>
            </div>
            <div class="modal-body container-full" v-if="this.$slots.body">
              <slot name="body"></slot>
            </div>
            <div class="modal-footer" v-if="this.$slots.footer">
              <slot name="footer"></slot>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </portal>
</template>

<script>

import { addStyle, removeStyle } from 'js-helpers/dist/element/style';
import { getWidth } from 'js-helpers/dist/element/dims';
import { addListener } from 'js-helpers/dist/element/event';
import { is } from 'js-helpers/dist/element/is';

export default {

    inheritAttrs: false,

    props: {
        show: {},
        strict: {},
        name: {},
        allowToClose: {},
        containerStyle: { default: () => {
            return {
              'border-radius': '2px',
              'box-shadow': '0 2px 8px rgba(0, 0, 0, .33)'
            }
          }
        },
        maskStyle:  { default: () => {
            return {
              'background-color': 'rgba(0, 0, 0, .5)'
            };
          }
        },
        size: { default: 'md' },
        center: { default: false },
        closeButton: { type: Boolean, default: true },
        transitionType: { default: 'modal' },
        portal: { default: 'modals' },
        scroll: { default: true }
    },

    data() {
        return{
            modal_name: '',
            show_modal: false
        };
    },

    computed: {
        containerClass() {
            return [
                `modal-${this.size}`,
                { 'modal-center': this.center }
            ];
        },
        maskStyles() {
            const defaultStyle = this.maskStyle || {};
            if(this.scroll) return { ...defaultStyle };
            return { overflow: 'hidden', ...defaultStyle };
        },
        transition() {
            if(this.center) return 'modal-fade';
            return this.transitionType;
        }
    },

    watch: {

        show(nVal, oldVal) {
            if(nVal) {
                this.$bus.$emit(`${this.modal_name ? `${this.modal_name}-` : ''}modal-opened`);
                this.$nextTick(() => {
                    addStyle('body', { overflow: 'hidden', 'margin-right': `${window.innerWidth - getWidth('body')}px` });
                });
            } else{
                this.$bus.$emit(`${this.modal_name ? `${this.modal_name}-` : ''}modal-closed`);
                this.$nextTick(() => {
                    removeStyle('body', { overflow: '', 'margin-right': '' });
                });
            }
        }

    },

    created() {
        this.modal_name = this.name ? this.name : '';
    },

    mounted() {
        this.$nextTick(function () {
            this.handleEvents();
            this.handleCloseEvents();
        });
    },

    methods: {

        handleEvents() {
            if(!this.modal_name) return;

            const self = this;

            this.$bus.$on(`change-${this.modal_name}-modal-state`, (state) => {
                if(state) {
                    self.handleShowModal();
                } else{
                    self.handleHideModal();
                }
            });
        },

        handleCloseEvents() {
            if(this.strict) return;

            const self = this;

            addListener(document, 'keydown', (e) => {
                if(self.hasAllowToCloseNow()) {
                    if(e.keyCode == 27) {
                        self.handleHideModal();
                        self.$bus.$emit(`${self.modal_name ? `${self.modal_name}-` : ''}modal-closed`);
                    }
                }
            });

            addListener(document, 'click touchstart', (e) => {
                if(self.show &&
                    (is(e.target, '.modal-mask') || is(e.target, '.modal-wrapper'))
                ) {
                    if(self.hasAllowToCloseNow()) {
                        self.handleHideModal();
                        self.$bus.$emit(`${self.modal_name ? `${self.modal_name}-` : ''}modal-closed`);
                    }
                }
            });
        },

        hasAllowToCloseNow() {
            return this.allowToClose;
        },

        handleHideModal() {
            this.close();
        },

        handleShowModal() {
            this.open();
        },
        open() {
          this.show_modal = true;
          this.$emit('show-modal');
        },
        close() {
          this.show_modal = false;
          this.$emit('hide-modal');
        }
    }
};
</script>
