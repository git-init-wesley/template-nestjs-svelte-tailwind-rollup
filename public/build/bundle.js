
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
	'use strict';

	/** @returns {void} */
	function noop() {}

	/**
	 * @template T
	 * @template S
	 * @param {T} tar
	 * @param {S} src
	 * @returns {T & S}
	 */
	function assign(tar, src) {
		// @ts-ignore
		for (const k in src) tar[k] = src[k];
		return /** @type {T & S} */ (tar);
	}

	/** @returns {void} */
	function add_location(element, file, line, column, char) {
		element.__svelte_meta = {
			loc: { file, line, column, char }
		};
	}

	function run(fn) {
		return fn();
	}

	function blank_object() {
		return Object.create(null);
	}

	/**
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function run_all(fns) {
		fns.forEach(run);
	}

	/**
	 * @param {any} thing
	 * @returns {thing is Function}
	 */
	function is_function(thing) {
		return typeof thing === 'function';
	}

	/** @returns {boolean} */
	function safe_not_equal(a, b) {
		return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
	}

	let src_url_equal_anchor;

	/**
	 * @param {string} element_src
	 * @param {string} url
	 * @returns {boolean}
	 */
	function src_url_equal(element_src, url) {
		if (element_src === url) return true;
		if (!src_url_equal_anchor) {
			src_url_equal_anchor = document.createElement('a');
		}
		// This is actually faster than doing URL(..).href
		src_url_equal_anchor.href = url;
		return element_src === src_url_equal_anchor.href;
	}

	/** @returns {boolean} */
	function is_empty(obj) {
		return Object.keys(obj).length === 0;
	}

	/** @returns {void} */
	function validate_store(store, name) {
		if (store != null && typeof store.subscribe !== 'function') {
			throw new Error(`'${name}' is not a store with a 'subscribe' method`);
		}
	}

	function subscribe(store, ...callbacks) {
		if (store == null) {
			for (const callback of callbacks) {
				callback(undefined);
			}
			return noop;
		}
		const unsub = store.subscribe(...callbacks);
		return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
	}

	/**
	 * Get the current value from a store by subscribing and immediately unsubscribing.
	 *
	 * https://svelte.dev/docs/svelte-store#get
	 * @template T
	 * @param {import('../store/public.js').Readable<T>} store
	 * @returns {T}
	 */
	function get_store_value(store) {
		let value;
		subscribe(store, (_) => (value = _))();
		return value;
	}

	/** @returns {void} */
	function component_subscribe(component, store, callback) {
		component.$$.on_destroy.push(subscribe(store, callback));
	}

	function action_destroyer(action_result) {
		return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
	}

	/** @type {typeof globalThis} */
	const globals =
		typeof window !== 'undefined'
			? window
			: typeof globalThis !== 'undefined'
			? globalThis
			: // @ts-ignore Node typings have this
			  global;

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append(target, node) {
		target.appendChild(node);
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert(target, node, anchor) {
		target.insertBefore(node, anchor || null);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach(node) {
		if (node.parentNode) {
			node.parentNode.removeChild(node);
		}
	}

	/**
	 * @template {keyof HTMLElementTagNameMap} K
	 * @param {K} name
	 * @returns {HTMLElementTagNameMap[K]}
	 */
	function element(name) {
		return document.createElement(name);
	}

	/**
	 * @param {string} data
	 * @returns {Text}
	 */
	function text(data) {
		return document.createTextNode(data);
	}

	/**
	 * @returns {Text} */
	function space() {
		return text(' ');
	}

	/**
	 * @returns {Text} */
	function empty() {
		return text('');
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr(node, attribute, value) {
		if (value == null) node.removeAttribute(attribute);
		else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
	}

	/**
	 * @param {Element} element
	 * @returns {ChildNode[]}
	 */
	function children(element) {
		return Array.from(element.childNodes);
	}

	/**
	 * @returns {void} */
	function set_style(node, key, value, important) {
		if (value == null) {
			node.style.removeProperty(key);
		} else {
			node.style.setProperty(key, value, important ? 'important' : '');
		}
	}

	/**
	 * @template T
	 * @param {string} type
	 * @param {T} [detail]
	 * @param {{ bubbles?: boolean, cancelable?: boolean }} [options]
	 * @returns {CustomEvent<T>}
	 */
	function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
		return new CustomEvent(type, { detail, bubbles, cancelable });
	}

	/**
	 * @typedef {Node & {
	 * 	claim_order?: number;
	 * 	hydrate_init?: true;
	 * 	actual_end_child?: NodeEx;
	 * 	childNodes: NodeListOf<NodeEx>;
	 * }} NodeEx
	 */

	/** @typedef {ChildNode & NodeEx} ChildNodeEx */

	/** @typedef {NodeEx & { claim_order: number }} NodeEx2 */

	/**
	 * @typedef {ChildNodeEx[] & {
	 * 	claim_info?: {
	 * 		last_index: number;
	 * 		total_claimed: number;
	 * 	};
	 * }} ChildNodeArray
	 */

	let current_component;

	/** @returns {void} */
	function set_current_component(component) {
		current_component = component;
	}

	function get_current_component() {
		if (!current_component) throw new Error('Function called outside component initialization');
		return current_component;
	}

	/**
	 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
	 * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
	 * it can be called from an external module).
	 *
	 * If a function is returned _synchronously_ from `onMount`, it will be called when the component is unmounted.
	 *
	 * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
	 *
	 * https://svelte.dev/docs/svelte#onmount
	 * @template T
	 * @param {() => import('./private.js').NotFunction<T> | Promise<import('./private.js').NotFunction<T>> | (() => any)} fn
	 * @returns {void}
	 */
	function onMount(fn) {
		get_current_component().$$.on_mount.push(fn);
	}

	/**
	 * Schedules a callback to run immediately before the component is unmounted.
	 *
	 * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
	 * only one that runs inside a server-side component.
	 *
	 * https://svelte.dev/docs/svelte#ondestroy
	 * @param {() => any} fn
	 * @returns {void}
	 */
	function onDestroy(fn) {
		get_current_component().$$.on_destroy.push(fn);
	}

	/**
	 * Associates an arbitrary `context` object with the current component and the specified `key`
	 * and returns that object. The context is then available to children of the component
	 * (including slotted content) with `getContext`.
	 *
	 * Like lifecycle functions, this must be called during component initialisation.
	 *
	 * https://svelte.dev/docs/svelte#setcontext
	 * @template T
	 * @param {any} key
	 * @param {T} context
	 * @returns {T}
	 */
	function setContext(key, context) {
		get_current_component().$$.context.set(key, context);
		return context;
	}

	/**
	 * Retrieves the context that belongs to the closest parent component with the specified `key`.
	 * Must be called during component initialisation.
	 *
	 * https://svelte.dev/docs/svelte#getcontext
	 * @template T
	 * @param {any} key
	 * @returns {T}
	 */
	function getContext(key) {
		return get_current_component().$$.context.get(key);
	}

	const dirty_components = [];
	const binding_callbacks = [];

	let render_callbacks = [];

	const flush_callbacks = [];

	const resolved_promise = /* @__PURE__ */ Promise.resolve();

	let update_scheduled = false;

	/** @returns {void} */
	function schedule_update() {
		if (!update_scheduled) {
			update_scheduled = true;
			resolved_promise.then(flush);
		}
	}

	/** @returns {Promise<void>} */
	function tick() {
		schedule_update();
		return resolved_promise;
	}

	/** @returns {void} */
	function add_render_callback(fn) {
		render_callbacks.push(fn);
	}

	// flush() calls callbacks in this order:
	// 1. All beforeUpdate callbacks, in order: parents before children
	// 2. All bind:this callbacks, in reverse order: children before parents.
	// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
	//    for afterUpdates called during the initial onMount, which are called in
	//    reverse order: children before parents.
	// Since callbacks might update component values, which could trigger another
	// call to flush(), the following steps guard against this:
	// 1. During beforeUpdate, any updated components will be added to the
	//    dirty_components array and will cause a reentrant call to flush(). Because
	//    the flush index is kept outside the function, the reentrant call will pick
	//    up where the earlier call left off and go through all dirty components. The
	//    current_component value is saved and restored so that the reentrant call will
	//    not interfere with the "parent" flush() call.
	// 2. bind:this callbacks cannot trigger new flush() calls.
	// 3. During afterUpdate, any updated components will NOT have their afterUpdate
	//    callback called a second time; the seen_callbacks set, outside the flush()
	//    function, guarantees this behavior.
	const seen_callbacks = new Set();

	let flushidx = 0; // Do *not* move this inside the flush() function

	/** @returns {void} */
	function flush() {
		// Do not reenter flush while dirty components are updated, as this can
		// result in an infinite loop. Instead, let the inner flush handle it.
		// Reentrancy is ok afterwards for bindings etc.
		if (flushidx !== 0) {
			return;
		}
		const saved_component = current_component;
		do {
			// first, call beforeUpdate functions
			// and update components
			try {
				while (flushidx < dirty_components.length) {
					const component = dirty_components[flushidx];
					flushidx++;
					set_current_component(component);
					update(component.$$);
				}
			} catch (e) {
				// reset dirty state to not end up in a deadlocked state and then rethrow
				dirty_components.length = 0;
				flushidx = 0;
				throw e;
			}
			set_current_component(null);
			dirty_components.length = 0;
			flushidx = 0;
			while (binding_callbacks.length) binding_callbacks.pop()();
			// then, once components are updated, call
			// afterUpdate functions. This may cause
			// subsequent updates...
			for (let i = 0; i < render_callbacks.length; i += 1) {
				const callback = render_callbacks[i];
				if (!seen_callbacks.has(callback)) {
					// ...so guard against infinite loops
					seen_callbacks.add(callback);
					callback();
				}
			}
			render_callbacks.length = 0;
		} while (dirty_components.length);
		while (flush_callbacks.length) {
			flush_callbacks.pop()();
		}
		update_scheduled = false;
		seen_callbacks.clear();
		set_current_component(saved_component);
	}

	/** @returns {void} */
	function update($$) {
		if ($$.fragment !== null) {
			$$.update();
			run_all($$.before_update);
			const dirty = $$.dirty;
			$$.dirty = [-1];
			$$.fragment && $$.fragment.p($$.ctx, dirty);
			$$.after_update.forEach(add_render_callback);
		}
	}

	/**
	 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function flush_render_callbacks(fns) {
		const filtered = [];
		const targets = [];
		render_callbacks.forEach((c) => (fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c)));
		targets.forEach((c) => c());
		render_callbacks = filtered;
	}

	const outroing = new Set();

	/**
	 * @type {Outro}
	 */
	let outros;

	/**
	 * @returns {void} */
	function group_outros() {
		outros = {
			r: 0,
			c: [],
			p: outros // parent group
		};
	}

	/**
	 * @returns {void} */
	function check_outros() {
		if (!outros.r) {
			run_all(outros.c);
		}
		outros = outros.p;
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} [local]
	 * @returns {void}
	 */
	function transition_in(block, local) {
		if (block && block.i) {
			outroing.delete(block);
			block.i(local);
		}
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} local
	 * @param {0 | 1} [detach]
	 * @param {() => void} [callback]
	 * @returns {void}
	 */
	function transition_out(block, local, detach, callback) {
		if (block && block.o) {
			if (outroing.has(block)) return;
			outroing.add(block);
			outros.c.push(() => {
				outroing.delete(block);
				if (callback) {
					if (detach) block.d(1);
					callback();
				}
			});
			block.o(local);
		} else if (callback) {
			callback();
		}
	}

	/** @typedef {1} INTRO */
	/** @typedef {0} OUTRO */
	/** @typedef {{ direction: 'in' | 'out' | 'both' }} TransitionOptions */
	/** @typedef {(node: Element, params: any, options: TransitionOptions) => import('../transition/public.js').TransitionConfig} TransitionFn */

	/**
	 * @typedef {Object} Outro
	 * @property {number} r
	 * @property {Function[]} c
	 * @property {Object} p
	 */

	/**
	 * @typedef {Object} PendingProgram
	 * @property {number} start
	 * @property {INTRO|OUTRO} b
	 * @property {Outro} [group]
	 */

	/**
	 * @typedef {Object} Program
	 * @property {number} a
	 * @property {INTRO|OUTRO} b
	 * @property {1|-1} d
	 * @property {number} duration
	 * @property {number} start
	 * @property {number} end
	 * @property {Outro} [group]
	 */

	// general each functions:

	function ensure_array_like(array_like_or_iterator) {
		return array_like_or_iterator?.length !== undefined
			? array_like_or_iterator
			: Array.from(array_like_or_iterator);
	}

	// keyed each functions:

	/** @returns {void} */
	function destroy_block(block, lookup) {
		block.d(1);
		lookup.delete(block.key);
	}

	/** @returns {void} */
	function outro_and_destroy_block(block, lookup) {
		transition_out(block, 1, 1, () => {
			lookup.delete(block.key);
		});
	}

	/** @returns {any[]} */
	function update_keyed_each(
		old_blocks,
		dirty,
		get_key,
		dynamic,
		ctx,
		list,
		lookup,
		node,
		destroy,
		create_each_block,
		next,
		get_context
	) {
		let o = old_blocks.length;
		let n = list.length;
		let i = o;
		const old_indexes = {};
		while (i--) old_indexes[old_blocks[i].key] = i;
		const new_blocks = [];
		const new_lookup = new Map();
		const deltas = new Map();
		const updates = [];
		i = n;
		while (i--) {
			const child_ctx = get_context(ctx, list, i);
			const key = get_key(child_ctx);
			let block = lookup.get(key);
			if (!block) {
				block = create_each_block(key, child_ctx);
				block.c();
			} else if (dynamic) {
				// defer updates until all the DOM shuffling is done
				updates.push(() => block.p(child_ctx, dirty));
			}
			new_lookup.set(key, (new_blocks[i] = block));
			if (key in old_indexes) deltas.set(key, Math.abs(i - old_indexes[key]));
		}
		const will_move = new Set();
		const did_move = new Set();
		/** @returns {void} */
		function insert(block) {
			transition_in(block, 1);
			block.m(node, next);
			lookup.set(block.key, block);
			next = block.first;
			n--;
		}
		while (o && n) {
			const new_block = new_blocks[n - 1];
			const old_block = old_blocks[o - 1];
			const new_key = new_block.key;
			const old_key = old_block.key;
			if (new_block === old_block) {
				// do nothing
				next = new_block.first;
				o--;
				n--;
			} else if (!new_lookup.has(old_key)) {
				// remove old block
				destroy(old_block, lookup);
				o--;
			} else if (!lookup.has(new_key) || will_move.has(new_key)) {
				insert(new_block);
			} else if (did_move.has(old_key)) {
				o--;
			} else if (deltas.get(new_key) > deltas.get(old_key)) {
				did_move.add(new_key);
				insert(new_block);
			} else {
				will_move.add(old_key);
				o--;
			}
		}
		while (o--) {
			const old_block = old_blocks[o];
			if (!new_lookup.has(old_block.key)) destroy(old_block, lookup);
		}
		while (n) insert(new_blocks[n - 1]);
		run_all(updates);
		return new_blocks;
	}

	/** @returns {void} */
	function validate_each_keys(ctx, list, get_context, get_key) {
		const keys = new Map();
		for (let i = 0; i < list.length; i++) {
			const key = get_key(get_context(ctx, list, i));
			if (keys.has(key)) {
				let value = '';
				try {
					value = `with value '${String(key)}' `;
				} catch (e) {
					// can't stringify
				}
				throw new Error(
					`Cannot have duplicate keys in a keyed each: Keys at index ${keys.get(
					key
				)} and ${i} ${value}are duplicates`
				);
			}
			keys.set(key, i);
		}
	}

	/** @returns {{}} */
	function get_spread_update(levels, updates) {
		const update = {};
		const to_null_out = {};
		const accounted_for = { $$scope: 1 };
		let i = levels.length;
		while (i--) {
			const o = levels[i];
			const n = updates[i];
			if (n) {
				for (const key in o) {
					if (!(key in n)) to_null_out[key] = 1;
				}
				for (const key in n) {
					if (!accounted_for[key]) {
						update[key] = n[key];
						accounted_for[key] = 1;
					}
				}
				levels[i] = n;
			} else {
				for (const key in o) {
					accounted_for[key] = 1;
				}
			}
		}
		for (const key in to_null_out) {
			if (!(key in update)) update[key] = undefined;
		}
		return update;
	}

	function get_spread_object(spread_props) {
		return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
	}

	/** @returns {void} */
	function create_component(block) {
		block && block.c();
	}

	/** @returns {void} */
	function mount_component(component, target, anchor) {
		const { fragment, after_update } = component.$$;
		fragment && fragment.m(target, anchor);
		// onMount happens before the initial afterUpdate
		add_render_callback(() => {
			const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
			// if the component was destroyed immediately
			// it will update the `$$.on_destroy` reference to `null`.
			// the destructured on_destroy may still reference to the old array
			if (component.$$.on_destroy) {
				component.$$.on_destroy.push(...new_on_destroy);
			} else {
				// Edge case - component was destroyed immediately,
				// most likely as a result of a binding initialising
				run_all(new_on_destroy);
			}
			component.$$.on_mount = [];
		});
		after_update.forEach(add_render_callback);
	}

	/** @returns {void} */
	function destroy_component(component, detaching) {
		const $$ = component.$$;
		if ($$.fragment !== null) {
			flush_render_callbacks($$.after_update);
			run_all($$.on_destroy);
			$$.fragment && $$.fragment.d(detaching);
			// TODO null out other refs, including component.$$ (but need to
			// preserve final state?)
			$$.on_destroy = $$.fragment = null;
			$$.ctx = [];
		}
	}

	/** @returns {void} */
	function make_dirty(component, i) {
		if (component.$$.dirty[0] === -1) {
			dirty_components.push(component);
			schedule_update();
			component.$$.dirty.fill(0);
		}
		component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
	}

	// TODO: Document the other params
	/**
	 * @param {SvelteComponent} component
	 * @param {import('./public.js').ComponentConstructorOptions} options
	 *
	 * @param {import('./utils.js')['not_equal']} not_equal Used to compare props and state values.
	 * @param {(target: Element | ShadowRoot) => void} [append_styles] Function that appends styles to the DOM when the component is first initialised.
	 * This will be the `add_css` function from the compiled component.
	 *
	 * @returns {void}
	 */
	function init$1(
		component,
		options,
		instance,
		create_fragment,
		not_equal,
		props,
		append_styles = null,
		dirty = [-1]
	) {
		const parent_component = current_component;
		set_current_component(component);
		/** @type {import('./private.js').T$$} */
		const $$ = (component.$$ = {
			fragment: null,
			ctx: [],
			// state
			props,
			update: noop,
			not_equal,
			bound: blank_object(),
			// lifecycle
			on_mount: [],
			on_destroy: [],
			on_disconnect: [],
			before_update: [],
			after_update: [],
			context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
			// everything else
			callbacks: blank_object(),
			dirty,
			skip_bound: false,
			root: options.target || parent_component.$$.root
		});
		append_styles && append_styles($$.root);
		let ready = false;
		$$.ctx = instance
			? instance(component, options.props || {}, (i, ret, ...rest) => {
					const value = rest.length ? rest[0] : ret;
					if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
						if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
						if (ready) make_dirty(component, i);
					}
					return ret;
			  })
			: [];
		$$.update();
		ready = true;
		run_all($$.before_update);
		// `false` as a special case of no DOM component
		$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
		if (options.target) {
			if (options.hydrate) {
				// TODO: what is the correct type here?
				// @ts-expect-error
				const nodes = children(options.target);
				$$.fragment && $$.fragment.l(nodes);
				nodes.forEach(detach);
			} else {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				$$.fragment && $$.fragment.c();
			}
			if (options.intro) transition_in(component.$$.fragment);
			mount_component(component, options.target, options.anchor);
			flush();
		}
		set_current_component(parent_component);
	}

	/**
	 * Base class for Svelte components. Used when dev=false.
	 *
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 */
	class SvelteComponent {
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$ = undefined;
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$set = undefined;

		/** @returns {void} */
		$destroy() {
			destroy_component(this, 1);
			this.$destroy = noop;
		}

		/**
		 * @template {Extract<keyof Events, string>} K
		 * @param {K} type
		 * @param {((e: Events[K]) => void) | null | undefined} callback
		 * @returns {() => void}
		 */
		$on(type, callback) {
			if (!is_function(callback)) {
				return noop;
			}
			const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
			callbacks.push(callback);
			return () => {
				const index = callbacks.indexOf(callback);
				if (index !== -1) callbacks.splice(index, 1);
			};
		}

		/**
		 * @param {Partial<Props>} props
		 * @returns {void}
		 */
		$set(props) {
			if (this.$$set && !is_empty(props)) {
				this.$$.skip_bound = true;
				this.$$set(props);
				this.$$.skip_bound = false;
			}
		}
	}

	/**
	 * @typedef {Object} CustomElementPropDefinition
	 * @property {string} [attribute]
	 * @property {boolean} [reflect]
	 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
	 */

	// generated during release, do not modify

	/**
	 * The current version, as set in package.json.
	 *
	 * https://svelte.dev/docs/svelte-compiler#svelte-version
	 * @type {string}
	 */
	const VERSION = '4.2.1';
	const PUBLIC_VERSION = '4';

	/**
	 * @template T
	 * @param {string} type
	 * @param {T} [detail]
	 * @returns {void}
	 */
	function dispatch_dev(type, detail) {
		document.dispatchEvent(custom_event(type, { version: VERSION, ...detail }, { bubbles: true }));
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append_dev(target, node) {
		dispatch_dev('SvelteDOMInsert', { target, node });
		append(target, node);
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert_dev(target, node, anchor) {
		dispatch_dev('SvelteDOMInsert', { target, node, anchor });
		insert(target, node, anchor);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach_dev(node) {
		dispatch_dev('SvelteDOMRemove', { node });
		detach(node);
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr_dev(node, attribute, value) {
		attr(node, attribute, value);
		if (value == null) dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
		else dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
	}

	function ensure_array_like_dev(arg) {
		if (
			typeof arg !== 'string' &&
			!(arg && typeof arg === 'object' && 'length' in arg) &&
			!(typeof Symbol === 'function' && arg && Symbol.iterator in arg)
		) {
			throw new Error('{#each} only works with iterable values.');
		}
		return ensure_array_like(arg);
	}

	/**
	 * @returns {void} */
	function validate_slots(name, slot, keys) {
		for (const slot_key of Object.keys(slot)) {
			if (!~keys.indexOf(slot_key)) {
				console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
			}
		}
	}

	function construct_svelte_component_dev(component, props) {
		const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
		try {
			const instance = new component(props);
			if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
				throw new Error(error_message);
			}
			return instance;
		} catch (err) {
			const { message } = err;
			if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
				throw new Error(error_message);
			} else {
				throw err;
			}
		}
	}

	/**
	 * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
	 *
	 * Can be used to create strongly typed Svelte components.
	 *
	 * #### Example:
	 *
	 * You have component library on npm called `component-library`, from which
	 * you export a component called `MyComponent`. For Svelte+TypeScript users,
	 * you want to provide typings. Therefore you create a `index.d.ts`:
	 * ```ts
	 * import { SvelteComponent } from "svelte";
	 * export class MyComponent extends SvelteComponent<{foo: string}> {}
	 * ```
	 * Typing this makes it possible for IDEs like VS Code with the Svelte extension
	 * to provide intellisense and to use the component like this in a Svelte file
	 * with TypeScript:
	 * ```svelte
	 * <script lang="ts">
	 * 	import { MyComponent } from "component-library";
	 * </script>
	 * <MyComponent foo={'bar'} />
	 * ```
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 * @template {Record<string, any>} [Slots=any]
	 * @extends {SvelteComponent<Props, Events>}
	 */
	class SvelteComponentDev extends SvelteComponent {
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Props}
		 */
		$$prop_def;
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Events}
		 */
		$$events_def;
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Slots}
		 */
		$$slot_def;

		/** @param {import('./public.js').ComponentConstructorOptions<Props>} options */
		constructor(options) {
			if (!options || (!options.target && !options.$$inline)) {
				throw new Error("'target' is a required option");
			}
			super();
		}

		/** @returns {void} */
		$destroy() {
			super.$destroy();
			this.$destroy = () => {
				console.warn('Component was already destroyed'); // eslint-disable-line no-console
			};
		}

		/** @returns {void} */
		$capture_state() {}

		/** @returns {void} */
		$inject_state() {}
	}

	if (typeof window !== 'undefined')
		// @ts-ignore
		(window.__svelte || (window.__svelte = { v: new Set() })).v.add(PUBLIC_VERSION);

	const subscriber_queue = [];

	/**
	 * Creates a `Readable` store that allows reading by subscription.
	 *
	 * https://svelte.dev/docs/svelte-store#readable
	 * @template T
	 * @param {T} [value] initial value
	 * @param {import('./public.js').StartStopNotifier<T>} [start]
	 * @returns {import('./public.js').Readable<T>}
	 */
	function readable(value, start) {
		return {
			subscribe: writable(value, start).subscribe
		};
	}

	/**
	 * Create a `Writable` store that allows both updating and reading by subscription.
	 *
	 * https://svelte.dev/docs/svelte-store#writable
	 * @template T
	 * @param {T} [value] initial value
	 * @param {import('./public.js').StartStopNotifier<T>} [start]
	 * @returns {import('./public.js').Writable<T>}
	 */
	function writable(value, start = noop) {
		/** @type {import('./public.js').Unsubscriber} */
		let stop;
		/** @type {Set<import('./private.js').SubscribeInvalidateTuple<T>>} */
		const subscribers = new Set();
		/** @param {T} new_value
		 * @returns {void}
		 */
		function set(new_value) {
			if (safe_not_equal(value, new_value)) {
				value = new_value;
				if (stop) {
					// store is ready
					const run_queue = !subscriber_queue.length;
					for (const subscriber of subscribers) {
						subscriber[1]();
						subscriber_queue.push(subscriber, value);
					}
					if (run_queue) {
						for (let i = 0; i < subscriber_queue.length; i += 2) {
							subscriber_queue[i][0](subscriber_queue[i + 1]);
						}
						subscriber_queue.length = 0;
					}
				}
			}
		}

		/**
		 * @param {import('./public.js').Updater<T>} fn
		 * @returns {void}
		 */
		function update(fn) {
			set(fn(value));
		}

		/**
		 * @param {import('./public.js').Subscriber<T>} run
		 * @param {import('./private.js').Invalidator<T>} [invalidate]
		 * @returns {import('./public.js').Unsubscriber}
		 */
		function subscribe(run, invalidate = noop) {
			/** @type {import('./private.js').SubscribeInvalidateTuple<T>} */
			const subscriber = [run, invalidate];
			subscribers.add(subscriber);
			if (subscribers.size === 1) {
				stop = start(set, update) || noop;
			}
			run(value);
			return () => {
				subscribers.delete(subscriber);
				if (subscribers.size === 0 && stop) {
					stop();
					stop = null;
				}
			};
		}
		return { set, update, subscribe };
	}

	/**
	 * Derived value store by synchronizing one or more readable stores and
	 * applying an aggregation function over its input values.
	 *
	 * https://svelte.dev/docs/svelte-store#derived
	 * @template {import('./private.js').Stores} S
	 * @template T
	 * @overload
	 * @param {S} stores - input stores
	 * @param {(values: import('./private.js').StoresValues<S>, set: (value: T) => void, update: (fn: import('./public.js').Updater<T>) => void) => import('./public.js').Unsubscriber | void} fn - function callback that aggregates the values
	 * @param {T} [initial_value] - initial value
	 * @returns {import('./public.js').Readable<T>}
	 */

	/**
	 * Derived value store by synchronizing one or more readable stores and
	 * applying an aggregation function over its input values.
	 *
	 * https://svelte.dev/docs/svelte-store#derived
	 * @template {import('./private.js').Stores} S
	 * @template T
	 * @overload
	 * @param {S} stores - input stores
	 * @param {(values: import('./private.js').StoresValues<S>) => T} fn - function callback that aggregates the values
	 * @param {T} [initial_value] - initial value
	 * @returns {import('./public.js').Readable<T>}
	 */

	/**
	 * @template {import('./private.js').Stores} S
	 * @template T
	 * @param {S} stores
	 * @param {Function} fn
	 * @param {T} [initial_value]
	 * @returns {import('./public.js').Readable<T>}
	 */
	function derived(stores, fn, initial_value) {
		const single = !Array.isArray(stores);
		/** @type {Array<import('./public.js').Readable<any>>} */
		const stores_array = single ? [stores] : stores;
		if (!stores_array.every(Boolean)) {
			throw new Error('derived() expects stores as input, got a falsy value');
		}
		const auto = fn.length < 2;
		return readable(initial_value, (set, update) => {
			let started = false;
			const values = [];
			let pending = 0;
			let cleanup = noop;
			const sync = () => {
				if (pending) {
					return;
				}
				cleanup();
				const result = fn(single ? values[0] : values, set, update);
				if (auto) {
					set(result);
				} else {
					cleanup = is_function(result) ? result : noop;
				}
			};
			const unsubscribers = stores_array.map((store, i) =>
				subscribe(
					store,
					(value) => {
						values[i] = value;
						pending &= ~(1 << i);
						if (started) {
							sync();
						}
					},
					() => {
						pending |= 1 << i;
					}
				)
			);
			started = true;
			sync();
			return function stop() {
				run_all(unsubscribers);
				cleanup();
				// We need to set this to false because callbacks can still happen despite having unsubscribed:
				// Callbacks might already be placed in the queue which doesn't know it should no longer
				// invoke this derived store.
				started = false;
			};
		});
	}

	const MATCH_PARAM = RegExp(/\:([^/()]+)/g);

	function handleScroll (element) {
	  if (navigator.userAgent.includes('jsdom')) return false
	  scrollAncestorsToTop(element);
	  handleHash();
	}

	function handleHash () {
	  if (navigator.userAgent.includes('jsdom')) return false
	  const { hash } = window.location;
	  if (hash) {
	    const validElementIdRegex = /^[A-Za-z]+[\w\-\:\.]*$/;
	    if (validElementIdRegex.test(hash.substring(1))) {
	      const el = document.querySelector(hash);
	      if (el) el.scrollIntoView();
	    }
	  }
	}

	function scrollAncestorsToTop (element) {
	  if (
	    element &&
	    element.scrollTo &&
	    element.dataset.routify !== 'scroll-lock' &&
	    element.dataset['routify-scroll'] !== 'lock'
	  ) {
	    element.style['scroll-behavior'] = 'auto';
	    element.scrollTo({ top: 0, behavior: 'auto' });
	    element.style['scroll-behavior'] = '';
	    scrollAncestorsToTop(element.parentElement);
	  }
	}

	const pathToRegex = (str, recursive) => {
	  const suffix = recursive ? '' : '/?$'; //fallbacks should match recursively
	  str = str.replace(/\/_fallback?$/, '(/|$)');
	  str = str.replace(/\/index$/, '(/index)?'); //index files should be matched even if not present in url
	  str = str.replace(MATCH_PARAM, '([^/]+)') + suffix;
	  return str
	};

	const pathToParamKeys = string => {
	  const paramsKeys = [];
	  let matches;
	  while ((matches = MATCH_PARAM.exec(string))) paramsKeys.push(matches[1]);
	  return paramsKeys
	};

	const pathToRank = ({ path }) => {
	  return path
	    .split('/')
	    .filter(Boolean)
	    .map(str => (str === '_fallback' ? 'A' : str.startsWith(':') ? 'B' : 'C'))
	    .join('')
	};

	let warningSuppressed = false;

	/* eslint no-console: 0 */
	function suppressWarnings () {
	  if (warningSuppressed) return
	  const consoleWarn = console.warn;
	  console.warn = function (msg, ...msgs) {
	    const ignores = [
	      "was created with unknown prop 'scoped'",
	      "was created with unknown prop 'scopedSync'",
	    ];
	    if (!ignores.find(iMsg => msg.includes(iMsg)))
	      return consoleWarn(msg, ...msgs)
	  };
	  warningSuppressed = true;
	}

	function currentLocation () {
	  const pathMatch = window.location.search.match(/__routify_path=([^&]+)/);
	  const prefetchMatch = window.location.search.match(/__routify_prefetch=\d+/);
	  window.routify = window.routify || {};
	  window.routify.prefetched = prefetchMatch ? true : false;
	  const path = pathMatch && pathMatch[1].replace(/[#?].+/, ''); // strip any thing after ? and #
	  return path || window.location.pathname
	}

	window.routify = window.routify || {};

	/** @type {import('svelte/store').Writable<RouteNode>} */
	const route = writable(null); // the actual route being rendered

	/** @type {import('svelte/store').Writable<RouteNode[]>} */
	const routes$1 = writable([]); // all routes
	routes$1.subscribe(routes => (window.routify.routes = routes));

	let rootContext = writable({ component: { params: {} } });

	/** @type {import('svelte/store').Writable<RouteNode>} */
	const urlRoute = writable(null);  // the route matching the url

	/** @type {import('svelte/store').Writable<String>} */
	const basepath = (() => {
	    const { set, subscribe } = writable("");

	    return {
	        subscribe,
	        set(value) {
	            if (value.match(/^[/(]/))
	                set(value);
	            else console.warn('Basepaths must start with / or (');
	        },
	        update() { console.warn('Use assignment or set to update basepaths.'); }
	    }
	})();

	const location$1 = derived( // the part of the url matching the basepath
	    [basepath, urlRoute],
	    ([$basepath, $route]) => {
	        const [, base, path] = currentLocation().match(`^(${$basepath})(${$route.regex})`) || [];
	        return { base, path }
	    }
	);

	const prefetchPath = writable("");

	function onAppLoaded({ path, metatags }) {
	    metatags.update();
	    const prefetchMatch = window.location.search.match(/__routify_prefetch=(\d+)/);
	    const prefetchId = prefetchMatch && prefetchMatch[1];

	    dispatchEvent(new CustomEvent('app-loaded'));
	    parent.postMessage({
	        msg: 'app-loaded',
	        prefetched: window.routify.prefetched,
	        path,
	        prefetchId
	    }, "*");
	    window['routify'].appLoaded = true;
	}

	var defaultConfig = {
	    queryHandler: {
	        parse: search => fromEntries(new URLSearchParams(search)),
	        stringify: params => '?' + (new URLSearchParams(params)).toString()
	    }
	};


	function fromEntries(iterable) {
	    return [...iterable].reduce((obj, [key, val]) => {
	        obj[key] = val;
	        return obj
	    }, {})
	}

	/**
	 * @param {string} url 
	 * @return {ClientNode}
	 */
	function urlToRoute(url) {
	    /** @type {RouteNode[]} */
	    const routes = get_store_value(routes$1);
	    const basepath$1 = get_store_value(basepath);
	    const route = routes.find(route => url.match(`^${basepath$1}${route.regex}`));
	    if (!route)
	        throw new Error(
	            `Route could not be found for "${url}".`
	        )

	    const [, base] = url.match(`^(${basepath$1})${route.regex}`);
	    const path = url.slice(base.length);

	    if (defaultConfig.queryHandler)
	        route.params = defaultConfig.queryHandler.parse(window.location.search);

	    if (route.paramKeys) {
	        const layouts = layoutByPos(route.layouts);
	        const fragments = path.split('/').filter(Boolean);
	        const routeProps = getRouteProps(route.path);

	        routeProps.forEach((prop, i) => {
	            if (prop) {
	                route.params[prop] = fragments[i];
	                if (layouts[i]) layouts[i].param = { [prop]: fragments[i] };
	                else route.param = { [prop]: fragments[i] };
	            }
	        });
	    }

	    route.leftover = url.replace(new RegExp(base + route.regex), '');

	    return route
	}


	/**
	 * @param {array} layouts
	 */
	function layoutByPos(layouts) {
	    const arr = [];
	    layouts.forEach(layout => {
	        arr[layout.path.split('/').filter(Boolean).length - 1] = layout;
	    });
	    return arr
	}


	/**
	 * @param {string} url
	 */
	function getRouteProps(url) {
	    return url
	        .split('/')
	        .filter(Boolean)
	        .map(f => f.match(/\:(.+)/))
	        .map(f => f && f[1])
	}

	/* node_modules\@sveltech\routify\runtime\Prefetcher.svelte generated by Svelte v4.2.1 */

	const { Object: Object_1$1 } = globals;
	const file$3 = "node_modules\\@sveltech\\routify\\runtime\\Prefetcher.svelte";

	function get_each_context$1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[1] = list[i];
		return child_ctx;
	}

	// (93:2) {#each $actives as prefetch (prefetch.options.prefetch)}
	function create_each_block$1(key_1, ctx) {
		let iframe;
		let iframe_src_value;

		const block = {
			key: key_1,
			first: null,
			c: function create() {
				iframe = element("iframe");
				if (!src_url_equal(iframe.src, iframe_src_value = /*prefetch*/ ctx[1].url)) attr_dev(iframe, "src", iframe_src_value);
				attr_dev(iframe, "frameborder", "0");
				attr_dev(iframe, "title", "routify prefetcher");
				add_location(iframe, file$3, 93, 4, 2705);
				this.first = iframe;
			},
			m: function mount(target, anchor) {
				insert_dev(target, iframe, anchor);
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;

				if (dirty & /*$actives*/ 1 && !src_url_equal(iframe.src, iframe_src_value = /*prefetch*/ ctx[1].url)) {
					attr_dev(iframe, "src", iframe_src_value);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(iframe);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block$1.name,
			type: "each",
			source: "(93:2) {#each $actives as prefetch (prefetch.options.prefetch)}",
			ctx
		});

		return block;
	}

	function create_fragment$5(ctx) {
		let div;
		let each_blocks = [];
		let each_1_lookup = new Map();
		let each_value = ensure_array_like_dev(/*$actives*/ ctx[0]);
		const get_key = ctx => /*prefetch*/ ctx[1].options.prefetch;
		validate_each_keys(ctx, each_value, get_each_context$1, get_key);

		for (let i = 0; i < each_value.length; i += 1) {
			let child_ctx = get_each_context$1(ctx, each_value, i);
			let key = get_key(child_ctx);
			each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
		}

		const block = {
			c: function create() {
				div = element("div");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				attr_dev(div, "id", "__routify_iframes");
				set_style(div, "display", "none");
				add_location(div, file$3, 91, 0, 2591);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(div, null);
					}
				}
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*$actives*/ 1) {
					each_value = ensure_array_like_dev(/*$actives*/ ctx[0]);
					validate_each_keys(ctx, each_value, get_each_context$1, get_key);
					each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, destroy_block, create_each_block$1, null, get_each_context$1);
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].d();
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$5.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	const iframeNum = 2;

	const defaults = {
		validFor: 60,
		timeout: 5000,
		gracePeriod: 1000
	};

	/** stores and subscriptions */
	const queue = writable([]);

	const actives = derived(queue, q => q.slice(0, iframeNum));

	actives.subscribe(actives => actives.forEach(({ options }) => {
		setTimeout(() => removeFromQueue(options.prefetch), options.timeout);
	}));

	function prefetch(path, options = {}) {
		prefetch.id = prefetch.id || 1;

		path = !path.href
		? path
		: path.href.replace(/^(?:\/\/|[^/]+)*\//, '/');

		//replace first ? since were mixing user queries with routify queries
		path = path.replace('?', '&');

		options = { ...defaults, ...options, path };
		options.prefetch = prefetch.id++;

		//don't prefetch within prefetch or SSR
		if (window.routify.prefetched || navigator.userAgent.match('jsdom')) return false;

		// add to queue
		queue.update(q => {
			if (!q.some(e => e.options.path === path)) q.push({
				url: `/__app.html?${optionsToQuery(options)}`,
				options
			});

			return q;
		});
	}

	/**
	 * convert options to query string
	 * {a:1,b:2} becomes __routify_a=1&routify_b=2
	 * @param {defaults & {path: string, prefetch: number}} options
	 */
	function optionsToQuery(options) {
		return Object.entries(options).map(([key, val]) => `__routify_${key}=${val}`).join('&');
	}

	/**
	 * @param {number|MessageEvent} idOrEvent
	 */
	function removeFromQueue(idOrEvent) {
		const id = idOrEvent.data ? idOrEvent.data.prefetchId : idOrEvent;
		if (!id) return null;
		const entry = get_store_value(queue).find(entry => entry && entry.options.prefetch == id);

		// removeFromQueue is called by both eventListener and timeout,
		// but we can only remove the item once
		if (entry) {
			const { gracePeriod } = entry.options;
			const gracePromise = new Promise(resolve => setTimeout(resolve, gracePeriod));

			const idlePromise = new Promise(resolve => {
					window.requestIdleCallback
					? window.requestIdleCallback(resolve)
					: setTimeout(resolve, gracePeriod + 1000);
				});

			Promise.all([gracePromise, idlePromise]).then(() => {
				queue.update(q => q.filter(q => q.options.prefetch != id));
			});
		}
	}

	// Listen to message from child window
	addEventListener('message', removeFromQueue, false);

	function instance$5($$self, $$props, $$invalidate) {
		let $actives;
		validate_store(actives, 'actives');
		component_subscribe($$self, actives, $$value => $$invalidate(0, $actives = $$value));
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Prefetcher', slots, []);
		const writable_props = [];

		Object_1$1.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Prefetcher> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({
			writable,
			derived,
			get: get_store_value,
			iframeNum,
			defaults,
			queue,
			actives,
			prefetch,
			optionsToQuery,
			removeFromQueue,
			$actives
		});

		return [$actives];
	}

	class Prefetcher extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init$1(this, options, instance$5, create_fragment$5, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Prefetcher",
				options,
				id: create_fragment$5.name
			});
		}
	}

	/// <reference path="../typedef.js" />

	/** @ts-check */
	/**
	 * @typedef {Object} RoutifyContext
	 * @prop {ClientNode} component
	 * @prop {ClientNode} layout
	 * @prop {any} componentFile 
	 * 
	 *  @returns {import('svelte/store').Readable<RoutifyContext>} */
	function getRoutifyContext() {
	  return getContext('routify') || rootContext
	}

	/**
	 * @callback AfterPageLoadHelper
	 * @param {function} callback
	 * 
	 * @typedef {import('svelte/store').Readable<AfterPageLoadHelper> & {_hooks:Array<function>}} AfterPageLoadHelperStore
	 * @type {AfterPageLoadHelperStore}
	 */
	const afterPageLoad = {
	  _hooks: [],
	  subscribe: hookHandler
	};

	/** 
	 * @callback BeforeUrlChangeHelper
	 * @param {function} callback
	 *
	 * @typedef {import('svelte/store').Readable<BeforeUrlChangeHelper> & {_hooks:Array<function>}} BeforeUrlChangeHelperStore
	 * @type {BeforeUrlChangeHelperStore}
	 **/
	const beforeUrlChange = {
	  _hooks: [],
	  subscribe: hookHandler
	};

	function hookHandler(listener) {
	  const hooks = this._hooks;
	  const index = hooks.length;
	  listener(callback => { hooks[index] = callback; });
	  return () => delete hooks[index]
	}

	/**
	 * @callback UrlHelper
	 * @param {String=} path
	 * @param {UrlParams=} params
	 * @param {UrlOptions=} options
	 * @return {String}
	 *
	 * @typedef {import('svelte/store').Readable<UrlHelper>} UrlHelperStore
	 * @type {UrlHelperStore} 
	 * */
	const url = {
	  subscribe(listener) {
	    const ctx = getRoutifyContext();
	    return derived(
	      [ctx, route, routes$1, location$1],
	      args => makeUrlHelper(...args)
	    ).subscribe(
	      listener
	    )
	  }
	};

	/** 
	 * @param {{component: ClientNode}} $ctx 
	 * @param {RouteNode} $oldRoute 
	 * @param {RouteNode[]} $routes 
	 * @param {{base: string, path: string}} $location
	 * @returns {UrlHelper}
	 */
	function makeUrlHelper($ctx, $oldRoute, $routes, $location) {
	  return function url(path, params, options) {
	    const { component } = $ctx;
	    path = path || './';

	    const strict = options && options.strict !== false;
	    if (!strict) path = path.replace(/index$/, '');

	    if (path.match(/^\.\.?\//)) {
	      //RELATIVE PATH
	      let [, breadcrumbs, relativePath] = path.match(/^([\.\/]+)(.*)/);
	      let dir = component.path.replace(/\/$/, '');
	      const traverse = breadcrumbs.match(/\.\.\//g) || [];
	      traverse.forEach(() => dir = dir.replace(/\/[^\/]+\/?$/, ''));
	      path = `${dir}/${relativePath}`.replace(/\/$/, '');

	    } else if (path.match(/^\//)) ; else {
	      // NAMED PATH
	      const matchingRoute = $routes.find(route => route.meta.name === path);
	      if (matchingRoute) path = matchingRoute.shortPath;
	    }

	    /** @type {Object<string, *>} Parameters */
	    const allParams = Object.assign({}, $oldRoute.params, component.params, params);
	    let pathWithParams = path;
	    for (const [key, value] of Object.entries(allParams)) {
	      pathWithParams = pathWithParams.replace(`:${key}`, value);
	    }

	    const fullPath = $location.base + pathWithParams + _getQueryString(path, params);
	    return fullPath.replace(/\?$/, '')
	  }
	}

	/**
	 * 
	 * @param {string} path 
	 * @param {object} params 
	 */
	function _getQueryString(path, params) {
	  if (!defaultConfig.queryHandler) return ""
	  const pathParamKeys = pathToParamKeys(path);
	  const queryParams = {};
	  if (params) Object.entries(params).forEach(([key, value]) => {
	    if (!pathParamKeys.includes(key))
	      queryParams[key] = value;
	  });
	  return defaultConfig.queryHandler.stringify(queryParams)
	}



	const _metatags = {
	  props: {},
	  templates: {},
	  services: {
	    plain: { propField: 'name', valueField: 'content' },
	    twitter: { propField: 'name', valueField: 'content' },
	    og: { propField: 'property', valueField: 'content' },
	  },
	  plugins: [
	    {
	      name: 'applyTemplate',
	      condition: () => true,
	      action: (prop, value) => {
	        const template = _metatags.getLongest(_metatags.templates, prop) || (x => x);
	        return [prop, template(value)]
	      }
	    },
	    {
	      name: 'createMeta',
	      condition: () => true,
	      action(prop, value) {
	        _metatags.writeMeta(prop, value);
	      }
	    },
	    {
	      name: 'createOG',
	      condition: prop => !prop.match(':'),
	      action(prop, value) {
	        _metatags.writeMeta(`og:${prop}`, value);
	      }
	    },
	    {
	      name: 'createTitle',
	      condition: prop => prop === 'title',
	      action(prop, value) {
	        document.title = value;
	      }
	    }
	  ],
	  getLongest(repo, name) {
	    const providers = repo[name];
	    if (providers) {
	      const currentPath = get_store_value(route).path;
	      const allPaths = Object.keys(repo[name]);
	      const matchingPaths = allPaths.filter(path => currentPath.includes(path));

	      const longestKey = matchingPaths.sort((a, b) => b.length - a.length)[0];

	      return providers[longestKey]
	    }
	  },
	  writeMeta(prop, value) {
	    const head = document.getElementsByTagName('head')[0];
	    const match = prop.match(/(.+)\:/);
	    const serviceName = match && match[1] || 'plain';
	    const { propField, valueField } = metatags.services[serviceName] || metatags.services.plain;
	    const oldElement = document.querySelector(`meta[${propField}='${prop}']`);
	    if (oldElement) oldElement.remove();

	    const newElement = document.createElement('meta');
	    newElement.setAttribute(propField, prop);
	    newElement.setAttribute(valueField, value);
	    newElement.setAttribute('data-origin', 'routify');
	    head.appendChild(newElement);
	  },
	  set(prop, value) {
	    _metatags.plugins.forEach(plugin => {
	      if (plugin.condition(prop, value))
	        [prop, value] = plugin.action(prop, value) || [prop, value];
	    });
	  },
	  clear() {
	    const oldElement = document.querySelector(`meta`);
	    if (oldElement) oldElement.remove();
	  },
	  template(name, fn) {
	    const origin = _metatags.getOrigin();
	    _metatags.templates[name] = _metatags.templates[name] || {};
	    _metatags.templates[name][origin] = fn;
	  },
	  update() {
	    Object.keys(_metatags.props).forEach((prop) => {
	      let value = (_metatags.getLongest(_metatags.props, prop));
	      _metatags.plugins.forEach(plugin => {
	        if (plugin.condition(prop, value)) {
	          [prop, value] = plugin.action(prop, value) || [prop, value];

	        }
	      });
	    });
	  },
	  batchedUpdate() {
	    if (!_metatags._pendingUpdate) {
	      _metatags._pendingUpdate = true;
	      setTimeout(() => {
	        _metatags._pendingUpdate = false;
	        this.update();
	      });
	    }
	  },
	  _updateQueued: false,
	  getOrigin() {
	    const routifyCtx = getRoutifyContext();
	    return routifyCtx && get_store_value(routifyCtx).path || '/'
	  },
	  _pendingUpdate: false
	};


	/**
	 * metatags
	 * @prop {Object.<string, string>}
	 */
	const metatags = new Proxy(_metatags, {
	  set(target, name, value, receiver) {
	    const { props, getOrigin } = target;

	    if (Reflect.has(target, name))
	      Reflect.set(target, name, value, receiver);
	    else {
	      props[name] = props[name] || {};
	      props[name][getOrigin()] = value;
	    }

	    if (window['routify'].appLoaded)
	      target.batchedUpdate();
	    return true
	  }
	});

	((function () {
	  const store = writable(false);
	  beforeUrlChange.subscribe(fn => fn(event => {
	    store.set(true);
	    return true
	  }));
	  
	  afterPageLoad.subscribe(fn => fn(event => store.set(false)));

	  return store
	}))();

	/* node_modules\@sveltech\routify\runtime\Route.svelte generated by Svelte v4.2.1 */
	const file$2 = "node_modules\\@sveltech\\routify\\runtime\\Route.svelte";

	function get_each_context_1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[19] = list[i].component;
		child_ctx[20] = list[i].componentFile;
		return child_ctx;
	}

	function get_each_context(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[19] = list[i].component;
		child_ctx[20] = list[i].componentFile;
		return child_ctx;
	}

	// (120:0) {#if $context}
	function create_if_block_1(ctx) {
		let current_block_type_index;
		let if_block;
		let if_block_anchor;
		let current;
		const if_block_creators = [create_if_block_2, create_if_block_3];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*$context*/ ctx[6].component.isLayout === false) return 0;
			if (/*remainingLayouts*/ ctx[5].length) return 1;
			return -1;
		}

		if (~(current_block_type_index = select_block_type(ctx))) {
			if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
		}

		const block = {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = empty();
			},
			m: function mount(target, anchor) {
				if (~current_block_type_index) {
					if_blocks[current_block_type_index].m(target, anchor);
				}

				insert_dev(target, if_block_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if (~current_block_type_index) {
						if_blocks[current_block_type_index].p(ctx, dirty);
					}
				} else {
					if (if_block) {
						group_outros();

						transition_out(if_blocks[previous_block_index], 1, 1, () => {
							if_blocks[previous_block_index] = null;
						});

						check_outros();
					}

					if (~current_block_type_index) {
						if_block = if_blocks[current_block_type_index];

						if (!if_block) {
							if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
							if_block.c();
						} else {
							if_block.p(ctx, dirty);
						}

						transition_in(if_block, 1);
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					} else {
						if_block = null;
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(if_block_anchor);
				}

				if (~current_block_type_index) {
					if_blocks[current_block_type_index].d(detaching);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1.name,
			type: "if",
			source: "(120:0) {#if $context}",
			ctx
		});

		return block;
	}

	// (132:36) 
	function create_if_block_3(ctx) {
		let each_blocks = [];
		let each_1_lookup = new Map();
		let each_1_anchor;
		let current;
		let each_value_1 = ensure_array_like_dev([/*$context*/ ctx[6]]);
		const get_key = ctx => /*component*/ ctx[19].path;
		validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

		for (let i = 0; i < 1; i += 1) {
			let child_ctx = get_each_context_1(ctx, each_value_1, i);
			let key = get_key(child_ctx);
			each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
		}

		const block = {
			c: function create() {
				for (let i = 0; i < 1; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty();
			},
			m: function mount(target, anchor) {
				for (let i = 0; i < 1; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(target, anchor);
					}
				}

				insert_dev(target, each_1_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				if (dirty & /*$context, scoped, scopedSync, layout, remainingLayouts, decorator, Decorator, scopeToChild*/ 100663407) {
					each_value_1 = ensure_array_like_dev([/*$context*/ ctx[6]]);
					group_outros();
					validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
					each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block_1, each_1_anchor, get_each_context_1);
					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;

				for (let i = 0; i < 1; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o: function outro(local) {
				for (let i = 0; i < 1; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(each_1_anchor);
				}

				for (let i = 0; i < 1; i += 1) {
					each_blocks[i].d(detaching);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_3.name,
			type: "if",
			source: "(132:36) ",
			ctx
		});

		return block;
	}

	// (121:2) {#if $context.component.isLayout === false}
	function create_if_block_2(ctx) {
		let each_blocks = [];
		let each_1_lookup = new Map();
		let each_1_anchor;
		let current;
		let each_value = ensure_array_like_dev([/*$context*/ ctx[6]]);
		const get_key = ctx => /*component*/ ctx[19].path;
		validate_each_keys(ctx, each_value, get_each_context, get_key);

		for (let i = 0; i < 1; i += 1) {
			let child_ctx = get_each_context(ctx, each_value, i);
			let key = get_key(child_ctx);
			each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
		}

		const block = {
			c: function create() {
				for (let i = 0; i < 1; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty();
			},
			m: function mount(target, anchor) {
				for (let i = 0; i < 1; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(target, anchor);
					}
				}

				insert_dev(target, each_1_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				if (dirty & /*$context, scoped, scopedSync, layout*/ 77) {
					each_value = ensure_array_like_dev([/*$context*/ ctx[6]]);
					group_outros();
					validate_each_keys(ctx, each_value, get_each_context, get_key);
					each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block, each_1_anchor, get_each_context);
					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;

				for (let i = 0; i < 1; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o: function outro(local) {
				for (let i = 0; i < 1; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(each_1_anchor);
				}

				for (let i = 0; i < 1; i += 1) {
					each_blocks[i].d(detaching);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_2.name,
			type: "if",
			source: "(121:2) {#if $context.component.isLayout === false}",
			ctx
		});

		return block;
	}

	// (134:6) <svelte:component         this={componentFile}         let:scoped={scopeToChild}         let:decorator         {scoped}         {scopedSync}         {...layout.param || {}}>
	function create_default_slot(ctx) {
		let route_1;
		let t;
		let current;

		route_1 = new Route({
				props: {
					layouts: [.../*remainingLayouts*/ ctx[5]],
					Decorator: typeof /*decorator*/ ctx[26] !== 'undefined'
					? /*decorator*/ ctx[26]
					: /*Decorator*/ ctx[1],
					childOfDecorator: /*layout*/ ctx[2].isDecorator,
					scoped: {
						.../*scoped*/ ctx[0],
						.../*scopeToChild*/ ctx[25]
					}
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(route_1.$$.fragment);
				t = space();
			},
			m: function mount(target, anchor) {
				mount_component(route_1, target, anchor);
				insert_dev(target, t, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const route_1_changes = {};
				if (dirty & /*remainingLayouts*/ 32) route_1_changes.layouts = [.../*remainingLayouts*/ ctx[5]];

				if (dirty & /*decorator, Decorator*/ 67108866) route_1_changes.Decorator = typeof /*decorator*/ ctx[26] !== 'undefined'
				? /*decorator*/ ctx[26]
				: /*Decorator*/ ctx[1];

				if (dirty & /*layout*/ 4) route_1_changes.childOfDecorator = /*layout*/ ctx[2].isDecorator;

				if (dirty & /*scoped, scopeToChild*/ 33554433) route_1_changes.scoped = {
					.../*scoped*/ ctx[0],
					.../*scopeToChild*/ ctx[25]
				};

				route_1.$set(route_1_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(route_1.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(route_1.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(t);
				}

				destroy_component(route_1, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot.name,
			type: "slot",
			source: "(134:6) <svelte:component         this={componentFile}         let:scoped={scopeToChild}         let:decorator         {scoped}         {scopedSync}         {...layout.param || {}}>",
			ctx
		});

		return block;
	}

	// (133:4) {#each [$context] as { component, componentFile }
	function create_each_block_1(key_1, ctx) {
		let first;
		let switch_instance;
		let switch_instance_anchor;
		let current;

		const switch_instance_spread_levels = [
			{ scoped: /*scoped*/ ctx[0] },
			{ scopedSync: /*scopedSync*/ ctx[3] },
			/*layout*/ ctx[2].param || {}
		];

		var switch_value = /*componentFile*/ ctx[20];

		function switch_props(ctx, dirty) {
			let switch_instance_props = {
				$$slots: {
					default: [
						create_default_slot,
						({ scoped: scopeToChild, decorator }) => ({ 25: scopeToChild, 26: decorator }),
						({ scoped: scopeToChild, decorator }) => (scopeToChild ? 33554432 : 0) | (decorator ? 67108864 : 0)
					]
				},
				$$scope: { ctx }
			};

			if (dirty !== undefined && dirty & /*scoped, scopedSync, layout*/ 13) {
				switch_instance_props = get_spread_update(switch_instance_spread_levels, [
					dirty & /*scoped*/ 1 && { scoped: /*scoped*/ ctx[0] },
					dirty & /*scopedSync*/ 8 && { scopedSync: /*scopedSync*/ ctx[3] },
					dirty & /*layout*/ 4 && get_spread_object(/*layout*/ ctx[2].param || {})
				]);
			} else {
				for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
					switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
				}
			}

			return {
				props: switch_instance_props,
				$$inline: true
			};
		}

		if (switch_value) {
			switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
		}

		const block = {
			key: key_1,
			first: null,
			c: function create() {
				first = empty();
				if (switch_instance) create_component(switch_instance.$$.fragment);
				switch_instance_anchor = empty();
				this.first = first;
			},
			m: function mount(target, anchor) {
				insert_dev(target, first, anchor);
				if (switch_instance) mount_component(switch_instance, target, anchor);
				insert_dev(target, switch_instance_anchor, anchor);
				current = true;
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;

				if (dirty & /*$context*/ 64 && switch_value !== (switch_value = /*componentFile*/ ctx[20])) {
					if (switch_instance) {
						group_outros();
						const old_component = switch_instance;

						transition_out(old_component.$$.fragment, 1, 0, () => {
							destroy_component(old_component, 1);
						});

						check_outros();
					}

					if (switch_value) {
						switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx, dirty));
						create_component(switch_instance.$$.fragment);
						transition_in(switch_instance.$$.fragment, 1);
						mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
					} else {
						switch_instance = null;
					}
				} else if (switch_value) {
					const switch_instance_changes = (dirty & /*scoped, scopedSync, layout*/ 13)
					? get_spread_update(switch_instance_spread_levels, [
							dirty & /*scoped*/ 1 && { scoped: /*scoped*/ ctx[0] },
							dirty & /*scopedSync*/ 8 && { scopedSync: /*scopedSync*/ ctx[3] },
							dirty & /*layout*/ 4 && get_spread_object(/*layout*/ ctx[2].param || {})
						])
					: {};

					if (dirty & /*$$scope, remainingLayouts, decorator, Decorator, layout, scoped, scopeToChild*/ 234881063) {
						switch_instance_changes.$$scope = { dirty, ctx };
					}

					switch_instance.$set(switch_instance_changes);
				}
			},
			i: function intro(local) {
				if (current) return;
				if (switch_instance) transition_in(switch_instance.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				if (switch_instance) transition_out(switch_instance.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(first);
					detach_dev(switch_instance_anchor);
				}

				if (switch_instance) destroy_component(switch_instance, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block_1.name,
			type: "each",
			source: "(133:4) {#each [$context] as { component, componentFile }",
			ctx
		});

		return block;
	}

	// (122:4) {#each [$context] as { component, componentFile }
	function create_each_block(key_1, ctx) {
		let first;
		let switch_instance;
		let switch_instance_anchor;
		let current;

		const switch_instance_spread_levels = [
			{ scoped: /*scoped*/ ctx[0] },
			{ scopedSync: /*scopedSync*/ ctx[3] },
			/*layout*/ ctx[2].param || {}
		];

		var switch_value = /*componentFile*/ ctx[20];

		function switch_props(ctx, dirty) {
			let switch_instance_props = {};

			if (dirty !== undefined && dirty & /*scoped, scopedSync, layout*/ 13) {
				switch_instance_props = get_spread_update(switch_instance_spread_levels, [
					dirty & /*scoped*/ 1 && { scoped: /*scoped*/ ctx[0] },
					dirty & /*scopedSync*/ 8 && { scopedSync: /*scopedSync*/ ctx[3] },
					dirty & /*layout*/ 4 && get_spread_object(/*layout*/ ctx[2].param || {})
				]);
			} else {
				for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
					switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
				}
			}

			return {
				props: switch_instance_props,
				$$inline: true
			};
		}

		if (switch_value) {
			switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
		}

		const block = {
			key: key_1,
			first: null,
			c: function create() {
				first = empty();
				if (switch_instance) create_component(switch_instance.$$.fragment);
				switch_instance_anchor = empty();
				this.first = first;
			},
			m: function mount(target, anchor) {
				insert_dev(target, first, anchor);
				if (switch_instance) mount_component(switch_instance, target, anchor);
				insert_dev(target, switch_instance_anchor, anchor);
				current = true;
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;

				if (dirty & /*$context*/ 64 && switch_value !== (switch_value = /*componentFile*/ ctx[20])) {
					if (switch_instance) {
						group_outros();
						const old_component = switch_instance;

						transition_out(old_component.$$.fragment, 1, 0, () => {
							destroy_component(old_component, 1);
						});

						check_outros();
					}

					if (switch_value) {
						switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx, dirty));
						create_component(switch_instance.$$.fragment);
						transition_in(switch_instance.$$.fragment, 1);
						mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
					} else {
						switch_instance = null;
					}
				} else if (switch_value) {
					const switch_instance_changes = (dirty & /*scoped, scopedSync, layout*/ 13)
					? get_spread_update(switch_instance_spread_levels, [
							dirty & /*scoped*/ 1 && { scoped: /*scoped*/ ctx[0] },
							dirty & /*scopedSync*/ 8 && { scopedSync: /*scopedSync*/ ctx[3] },
							dirty & /*layout*/ 4 && get_spread_object(/*layout*/ ctx[2].param || {})
						])
					: {};

					switch_instance.$set(switch_instance_changes);
				}
			},
			i: function intro(local) {
				if (current) return;
				if (switch_instance) transition_in(switch_instance.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				if (switch_instance) transition_out(switch_instance.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(first);
					detach_dev(switch_instance_anchor);
				}

				if (switch_instance) destroy_component(switch_instance, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block.name,
			type: "each",
			source: "(122:4) {#each [$context] as { component, componentFile }",
			ctx
		});

		return block;
	}

	// (152:0) {#if !parentElement}
	function create_if_block$1(ctx) {
		let span;
		let mounted;
		let dispose;

		const block = {
			c: function create() {
				span = element("span");
				add_location(span, file$2, 152, 2, 4450);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);

				if (!mounted) {
					dispose = action_destroyer(/*setParent*/ ctx[8].call(null, span));
					mounted = true;
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span);
				}

				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$1.name,
			type: "if",
			source: "(152:0) {#if !parentElement}",
			ctx
		});

		return block;
	}

	function create_fragment$4(ctx) {
		let t;
		let if_block1_anchor;
		let current;
		let if_block0 = /*$context*/ ctx[6] && create_if_block_1(ctx);
		let if_block1 = !/*parentElement*/ ctx[4] && create_if_block$1(ctx);

		const block = {
			c: function create() {
				if (if_block0) if_block0.c();
				t = space();
				if (if_block1) if_block1.c();
				if_block1_anchor = empty();
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				if (if_block0) if_block0.m(target, anchor);
				insert_dev(target, t, anchor);
				if (if_block1) if_block1.m(target, anchor);
				insert_dev(target, if_block1_anchor, anchor);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				if (/*$context*/ ctx[6]) {
					if (if_block0) {
						if_block0.p(ctx, dirty);

						if (dirty & /*$context*/ 64) {
							transition_in(if_block0, 1);
						}
					} else {
						if_block0 = create_if_block_1(ctx);
						if_block0.c();
						transition_in(if_block0, 1);
						if_block0.m(t.parentNode, t);
					}
				} else if (if_block0) {
					group_outros();

					transition_out(if_block0, 1, 1, () => {
						if_block0 = null;
					});

					check_outros();
				}

				if (!/*parentElement*/ ctx[4]) {
					if (if_block1) ; else {
						if_block1 = create_if_block$1(ctx);
						if_block1.c();
						if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block0);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block0);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(t);
					detach_dev(if_block1_anchor);
				}

				if (if_block0) if_block0.d(detaching);
				if (if_block1) if_block1.d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$4.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$4($$self, $$props, $$invalidate) {
		let $route;
		let $context;
		validate_store(route, 'route');
		component_subscribe($$self, route, $$value => $$invalidate(14, $route = $$value));
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Route', slots, []);
		let { layouts = [] } = $$props;
		let { scoped = {} } = $$props;
		let { Decorator = null } = $$props;
		let { childOfDecorator = false } = $$props;
		let { isRoot = false } = $$props;
		let scopedSync = {};
		let isDecorator = false;

		/** @type {HTMLElement} */
		let parentElement;

		/** @type {LayoutOrDecorator} */
		let layout = null;

		/** @type {LayoutOrDecorator} */
		let lastLayout = null;

		/** @type {LayoutOrDecorator[]} */
		let remainingLayouts = [];

		const context = writable(null);
		validate_store(context, 'context');
		component_subscribe($$self, context, value => $$invalidate(6, $context = value));

		/** @type {import("svelte/store").Writable<Context>} */
		const parentContextStore = getContext('routify');

		isDecorator = Decorator && !childOfDecorator;
		setContext('routify', context);

		/** @param {HTMLElement} el */
		function setParent(el) {
			$$invalidate(4, parentElement = el.parentElement);
		}

		/** @param {SvelteComponent} componentFile */
		function onComponentLoaded(componentFile) {
			/** @type {Context} */
			const parentContext = get_store_value(parentContextStore);

			$$invalidate(3, scopedSync = { ...scoped });
			lastLayout = layout;
			if (remainingLayouts.length === 0) onLastComponentLoaded();

			const ctx = {
				layout: isDecorator ? parentContext.layout : layout,
				component: layout,
				route: $route,
				componentFile,
				child: isDecorator
				? parentContext.child
				: get_store_value(context) && get_store_value(context).child
			};

			context.set(ctx);
			if (isRoot) rootContext.set(ctx);

			if (parentContext && !isDecorator) parentContextStore.update(store => {
				store.child = layout || store.child;
				return store;
			});
		}

		/**  @param {LayoutOrDecorator} layout */
		function setComponent(layout) {
			let PendingComponent = layout.component();
			if (PendingComponent instanceof Promise) PendingComponent.then(onComponentLoaded); else onComponentLoaded(PendingComponent);
		}

		async function onLastComponentLoaded() {
			afterPageLoad._hooks.forEach(hook => hook(layout.api));
			await tick();
			handleScroll(parentElement);

			if (!window['routify'].appLoaded) {
				const pagePath = $context.component.path;
				const routePath = $route.path;
				const isOnCurrentRoute = pagePath === routePath; //maybe we're getting redirected

				// Let everyone know the last child has rendered
				if (!window['routify'].stopAutoReady && isOnCurrentRoute) {
					onAppLoaded({ path: pagePath, metatags });
				}
			}
		}

		const writable_props = ['layouts', 'scoped', 'Decorator', 'childOfDecorator', 'isRoot'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Route> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('layouts' in $$props) $$invalidate(9, layouts = $$props.layouts);
			if ('scoped' in $$props) $$invalidate(0, scoped = $$props.scoped);
			if ('Decorator' in $$props) $$invalidate(1, Decorator = $$props.Decorator);
			if ('childOfDecorator' in $$props) $$invalidate(10, childOfDecorator = $$props.childOfDecorator);
			if ('isRoot' in $$props) $$invalidate(11, isRoot = $$props.isRoot);
		};

		$$self.$capture_state = () => ({
			getContext,
			setContext,
			onDestroy,
			onMount,
			tick,
			writable,
			get: get_store_value,
			metatags,
			afterPageLoad,
			route,
			routes: routes$1,
			rootContext,
			handleScroll,
			onAppLoaded,
			layouts,
			scoped,
			Decorator,
			childOfDecorator,
			isRoot,
			scopedSync,
			isDecorator,
			parentElement,
			layout,
			lastLayout,
			remainingLayouts,
			context,
			parentContextStore,
			setParent,
			onComponentLoaded,
			setComponent,
			onLastComponentLoaded,
			$route,
			$context
		});

		$$self.$inject_state = $$props => {
			if ('layouts' in $$props) $$invalidate(9, layouts = $$props.layouts);
			if ('scoped' in $$props) $$invalidate(0, scoped = $$props.scoped);
			if ('Decorator' in $$props) $$invalidate(1, Decorator = $$props.Decorator);
			if ('childOfDecorator' in $$props) $$invalidate(10, childOfDecorator = $$props.childOfDecorator);
			if ('isRoot' in $$props) $$invalidate(11, isRoot = $$props.isRoot);
			if ('scopedSync' in $$props) $$invalidate(3, scopedSync = $$props.scopedSync);
			if ('isDecorator' in $$props) $$invalidate(12, isDecorator = $$props.isDecorator);
			if ('parentElement' in $$props) $$invalidate(4, parentElement = $$props.parentElement);
			if ('layout' in $$props) $$invalidate(2, layout = $$props.layout);
			if ('lastLayout' in $$props) lastLayout = $$props.lastLayout;
			if ('remainingLayouts' in $$props) $$invalidate(5, remainingLayouts = $$props.remainingLayouts);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*isDecorator, Decorator, layouts*/ 4610) {
				if (isDecorator) {
					const decoratorLayout = {
						component: () => Decorator,
						path: `${layouts[0].path}__decorator`,
						isDecorator: true
					};

					$$invalidate(9, layouts = [decoratorLayout, ...layouts]);
				}
			}

			if ($$self.$$.dirty & /*layouts*/ 512) {
				$$invalidate(2, [layout, ...remainingLayouts] = layouts, layout, ((($$invalidate(5, remainingLayouts), $$invalidate(9, layouts)), $$invalidate(12, isDecorator)), $$invalidate(1, Decorator)));
			}

			if ($$self.$$.dirty & /*layout*/ 4) {
				setComponent(layout);
			}
		};

		return [
			scoped,
			Decorator,
			layout,
			scopedSync,
			parentElement,
			remainingLayouts,
			$context,
			context,
			setParent,
			layouts,
			childOfDecorator,
			isRoot,
			isDecorator
		];
	}

	class Route extends SvelteComponentDev {
		constructor(options) {
			super(options);

			init$1(this, options, instance$4, create_fragment$4, safe_not_equal, {
				layouts: 9,
				scoped: 0,
				Decorator: 1,
				childOfDecorator: 10,
				isRoot: 11
			});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Route",
				options,
				id: create_fragment$4.name
			});
		}

		get layouts() {
			throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set layouts(value) {
			throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get scoped() {
			throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set scoped(value) {
			throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get Decorator() {
			throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set Decorator(value) {
			throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get childOfDecorator() {
			throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set childOfDecorator(value) {
			throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get isRoot() {
			throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set isRoot(value) {
			throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	function init(routes, callback) {
	  /** @type { ClientNode | false } */
	  let lastRoute = false;

	  function updatePage(proxyToUrl, shallow) {
	    const url = proxyToUrl || currentLocation();
	    const route$1 = urlToRoute(url);
	    const currentRoute = shallow && urlToRoute(currentLocation());
	    const contextRoute = currentRoute || route$1;
	    const layouts = [...contextRoute.layouts, route$1];
	    if (lastRoute) delete lastRoute.last; //todo is a page component the right place for the previous route?
	    route$1.last = lastRoute;
	    lastRoute = route$1;

	    //set the route in the store
	    if (!proxyToUrl)
	      urlRoute.set(route$1);
	    route.set(route$1);

	    //run callback in Router.svelte
	    callback(layouts);
	  }

	  const destroy = createEventListeners(updatePage);

	  return { updatePage, destroy }
	}

	/**
	 * svelte:window events doesn't work on refresh
	 * @param {Function} updatePage
	 */
	function createEventListeners(updatePage) {
	['pushState', 'replaceState'].forEach(eventName => {
	    const fn = history[eventName];
	    history[eventName] = async function (state = {}, title, url) {
	      const { id, path, params } = get_store_value(route);
	      state = { id, path, params, ...state };
	      const event = new Event(eventName.toLowerCase());
	      Object.assign(event, { state, title, url });

	      if (await runHooksBeforeUrlChange(event)) {
	        fn.apply(this, [state, title, url]);
	        return dispatchEvent(event)
	      }
	    };
	  });

	  let _ignoreNextPop = false;

	  const listeners = {
	    click: handleClick,
	    pushstate: () => updatePage(),
	    replacestate: () => updatePage(),
	    popstate: async event => {
	      if (_ignoreNextPop)
	        _ignoreNextPop = false;
	      else {
	        if (await runHooksBeforeUrlChange(event)) {
	          updatePage();
	        } else {
	          _ignoreNextPop = true;
	          event.preventDefault();
	          history.go(1);
	        }
	      }
	    },
	  };

	  Object.entries(listeners).forEach(args => addEventListener(...args));

	  const unregister = () => {
	    Object.entries(listeners).forEach(args => removeEventListener(...args));
	  };

	  return unregister
	}

	function handleClick(event) {
	  const el = event.target.closest('a');
	  const href = el && el.getAttribute('href');

	  if (
	    event.ctrlKey ||
	    event.metaKey ||
	    event.altKey ||
	    event.shiftKey ||
	    event.button ||
	    event.defaultPrevented
	  )
	    return
	  if (!href || el.target || el.host !== location.host) return

	  event.preventDefault();
	  history.pushState({}, '', href);
	}

	async function runHooksBeforeUrlChange(event) {
	  const route$1 = get_store_value(route);
	  for (const hook of beforeUrlChange._hooks.filter(Boolean)) {
	    // return false if the hook returns false
	    const result = await hook(event, route$1); //todo remove route from hook. Its API Can be accessed as $page
	    if (!result) return false
	  }
	  return true
	}

	/* node_modules\@sveltech\routify\runtime\Router.svelte generated by Svelte v4.2.1 */

	const { Object: Object_1 } = globals;

	// (64:0) {#if layouts && $route !== null}
	function create_if_block(ctx) {
		let route_1;
		let current;

		route_1 = new Route({
				props: {
					layouts: /*layouts*/ ctx[0],
					isRoot: true
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(route_1.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(route_1, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const route_1_changes = {};
				if (dirty & /*layouts*/ 1) route_1_changes.layouts = /*layouts*/ ctx[0];
				route_1.$set(route_1_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(route_1.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(route_1.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(route_1, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block.name,
			type: "if",
			source: "(64:0) {#if layouts && $route !== null}",
			ctx
		});

		return block;
	}

	function create_fragment$3(ctx) {
		let t;
		let prefetcher;
		let current;
		let if_block = /*layouts*/ ctx[0] && /*$route*/ ctx[1] !== null && create_if_block(ctx);
		prefetcher = new Prefetcher({ $$inline: true });

		const block = {
			c: function create() {
				if (if_block) if_block.c();
				t = space();
				create_component(prefetcher.$$.fragment);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert_dev(target, t, anchor);
				mount_component(prefetcher, target, anchor);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				if (/*layouts*/ ctx[0] && /*$route*/ ctx[1] !== null) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*layouts, $route*/ 3) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(t.parentNode, t);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				transition_in(prefetcher.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				transition_out(prefetcher.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(t);
				}

				if (if_block) if_block.d(detaching);
				destroy_component(prefetcher, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$3.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$3($$self, $$props, $$invalidate) {
		let $route;
		validate_store(route, 'route');
		component_subscribe($$self, route, $$value => $$invalidate(1, $route = $$value));
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Router', slots, []);
		let { routes } = $$props;
		let { config = {} } = $$props;
		let layouts;
		let navigator;
		window.routify = window.routify || {};
		window.routify.inBrowser = !window.navigator.userAgent.match('jsdom');

		Object.entries(config).forEach(([key, value]) => {
			defaultConfig[key] = value;
		});

		suppressWarnings();
		const updatePage = (...args) => navigator && navigator.updatePage(...args);
		setContext('routifyupdatepage', updatePage);
		const callback = res => $$invalidate(0, layouts = res);

		const cleanup = () => {
			if (!navigator) return;
			navigator.destroy();
			navigator = null;
		};

		let initTimeout = null;

		// init is async to prevent a horrible bug that completely disable reactivity
		// in the host component -- something like the component's update function is
		// called before its fragment is created, and since the component is then seen
		// as already dirty, it is never scheduled for update again, and remains dirty
		// forever... I failed to isolate the precise conditions for the bug, but the
		// faulty update is triggered by a change in the route store, and so offseting
		// store initialization by one tick gives the host component some time to
		// create its fragment. The root cause it probably a bug in Svelte with deeply
		// intertwinned store and reactivity.
		const doInit = () => {
			clearTimeout(initTimeout);

			initTimeout = setTimeout(() => {
				cleanup();
				navigator = init(routes, callback);
				routes$1.set(routes);
				navigator.updatePage();
			});
		};

		onDestroy(cleanup);

		$$self.$$.on_mount.push(function () {
			if (routes === undefined && !('routes' in $$props || $$self.$$.bound[$$self.$$.props['routes']])) {
				console.warn("<Router> was created without expected prop 'routes'");
			}
		});

		const writable_props = ['routes', 'config'];

		Object_1.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Router> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('routes' in $$props) $$invalidate(2, routes = $$props.routes);
			if ('config' in $$props) $$invalidate(3, config = $$props.config);
		};

		$$self.$capture_state = () => ({
			setContext,
			onDestroy,
			Route,
			Prefetcher,
			init,
			route,
			routesStore: routes$1,
			prefetchPath,
			suppressWarnings,
			defaultConfig,
			routes,
			config,
			layouts,
			navigator,
			updatePage,
			callback,
			cleanup,
			initTimeout,
			doInit,
			$route
		});

		$$self.$inject_state = $$props => {
			if ('routes' in $$props) $$invalidate(2, routes = $$props.routes);
			if ('config' in $$props) $$invalidate(3, config = $$props.config);
			if ('layouts' in $$props) $$invalidate(0, layouts = $$props.layouts);
			if ('navigator' in $$props) navigator = $$props.navigator;
			if ('initTimeout' in $$props) initTimeout = $$props.initTimeout;
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*routes*/ 4) {
				if (routes) doInit();
			}
		};

		return [layouts, $route, routes, config];
	}

	class Router extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init$1(this, options, instance$3, create_fragment$3, safe_not_equal, { routes: 2, config: 3 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Router",
				options,
				id: create_fragment$3.name
			});
		}

		get routes() {
			throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set routes(value) {
			throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get config() {
			throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set config(value) {
			throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/** 
	 * Node payload
	 * @typedef {Object} NodePayload
	 * @property {RouteNode=} file current node
	 * @property {RouteNode=} parent parent of the current node
	 * @property {StateObject=} state state shared by every node in the walker
	 * @property {Object=} scope scope inherited by descendants in the scope
	 *
	 * State Object
	 * @typedef {Object} StateObject
	 * @prop {TreePayload=} treePayload payload from the tree
	 * 
	 * Node walker proxy
	 * @callback NodeWalkerProxy
	 * @param {NodePayload} NodePayload
	 */


	/**
	 * Node middleware
	 * @description Walks through the nodes of a tree
	 * @example middleware = createNodeMiddleware(payload => {payload.file.name = 'hello'})(treePayload))
	 * @param {NodeWalkerProxy} fn 
	 */
	function createNodeMiddleware(fn) {

	    /**    
	     * NodeMiddleware payload receiver
	     * @param {TreePayload} payload
	     */
	    const inner = async function execute(payload) {
	        return await nodeMiddleware(payload.tree, fn, { state: { treePayload: payload } })
	    };

	    /**    
	     * NodeMiddleware sync payload receiver
	     * @param {TreePayload} payload
	     */
	    inner.sync = function executeSync(payload) {
	        return nodeMiddlewareSync(payload.tree, fn, { state: { treePayload: payload } })
	    };

	    return inner
	}

	/**
	 * Node walker
	 * @param {Object} file mutable file
	 * @param {NodeWalkerProxy} fn function to be called for each file
	 * @param {NodePayload=} payload 
	 */
	async function nodeMiddleware(file, fn, payload) {
	    const { state, scope, parent } = payload || {};
	    payload = {
	        file,
	        parent,
	        state: state || {},            //state is shared by all files in the walk
	        scope: clone(scope || {}),     //scope is inherited by descendants
	    };

	    await fn(payload);

	    if (file.children) {
	        payload.parent = file;
	        await Promise.all(file.children.map(_file => nodeMiddleware(_file, fn, payload)));
	    }
	    return payload
	}

	/**
	 * Node walker (sync version)
	 * @param {Object} file mutable file
	 * @param {NodeWalkerProxy} fn function to be called for each file
	 * @param {NodePayload=} payload 
	 */
	function nodeMiddlewareSync(file, fn, payload) {
	    const { state, scope, parent } = payload || {};
	    payload = {
	        file,
	        parent,
	        state: state || {},            //state is shared by all files in the walk
	        scope: clone(scope || {}),     //scope is inherited by descendants
	    };

	    fn(payload);

	    if (file.children) {
	        payload.parent = file;
	        file.children.map(_file => nodeMiddlewareSync(_file, fn, payload));
	    }
	    return payload
	}


	/**
	 * Clone with JSON
	 * @param {T} obj 
	 * @returns {T} JSON cloned object
	 * @template T
	 */
	function clone(obj) { return JSON.parse(JSON.stringify(obj)) }

	const setRegex = createNodeMiddleware(({ file }) => {
	    if (file.isPage || file.isFallback)
	        file.regex = pathToRegex(file.path, file.isFallback);
	});
	const setParamKeys = createNodeMiddleware(({ file }) => {
	    file.paramKeys = pathToParamKeys(file.path);
	});

	const setShortPath = createNodeMiddleware(({ file }) => {
	    if (file.isFallback || file.isIndex)
	        file.shortPath = file.path.replace(/\/[^/]+$/, '');
	    else file.shortPath = file.path;
	});
	const setRank = createNodeMiddleware(({ file }) => {
	    file.ranking = pathToRank(file);
	});


	// todo delete?
	const addMetaChildren = createNodeMiddleware(({ file }) => {
	    const node = file;
	    const metaChildren = file.meta && file.meta.children || [];
	    if (metaChildren.length) {
	        node.children = node.children || [];
	        node.children.push(...metaChildren.map(meta => ({ isMeta: true, ...meta, meta })));
	    }
	});

	const setIsIndexable = createNodeMiddleware(payload => {
	    const { file } = payload;
	    const { isLayout, isFallback, meta } = file;
	    file.isIndexable = !isLayout && !isFallback && meta.index !== false;
	    file.isNonIndexable = !file.isIndexable;
	});


	const assignRelations = createNodeMiddleware(({ file, parent }) => {
	    Object.defineProperty(file, 'parent', { get: () => parent });
	    Object.defineProperty(file, 'nextSibling', { get: () => _getSibling(file, 1) });
	    Object.defineProperty(file, 'prevSibling', { get: () => _getSibling(file, -1) });
	    Object.defineProperty(file, 'lineage', { get: () => _getLineage(parent) });
	});

	function _getLineage(node, lineage = []){
	    if(node){
	        lineage.unshift(node);
	        _getLineage(node.parent, lineage);
	    }
	    return lineage
	}

	/**
	 * 
	 * @param {RouteNode} file 
	 * @param {Number} direction 
	 */
	function _getSibling(file, direction) {
	    if (!file.root) {
	        const siblings = file.parent.children.filter(c => c.isIndexable);
	        const index = siblings.indexOf(file);
	        return siblings[index + direction]
	    }
	}

	const assignIndex = createNodeMiddleware(({ file, parent }) => {
	    if (file.isIndex) Object.defineProperty(parent, 'index', { get: () => file });
	    if (file.isLayout)
	        Object.defineProperty(parent, 'layout', { get: () => file });
	});

	const assignLayout = createNodeMiddleware(({ file, scope }) => {
	    Object.defineProperty(file, 'layouts', { get: () => getLayouts(file) });
	    function getLayouts(file) {
	        const { parent } = file;
	        const layout = parent && parent.layout;
	        const isReset = layout && layout.isReset;
	        const layouts = (parent && !isReset && getLayouts(parent)) || [];
	        if (layout) layouts.push(layout);
	        return layouts
	    }
	});


	const createFlatList = treePayload => {
	    createNodeMiddleware(payload => {
	        if (payload.file.isPage || payload.file.isFallback)
	        payload.state.treePayload.routes.push(payload.file);
	    }).sync(treePayload);    
	    treePayload.routes.sort((c, p) => (c.ranking >= p.ranking ? -1 : 1));
	};

	const setPrototype = createNodeMiddleware(({ file }) => {
	    const Prototype = file.root
	        ? Root
	        : file.children
	            ? file.isFile ? PageDir : Dir
	            : file.isReset
	                ? Reset
	                : file.isLayout
	                    ? Layout
	                    : file.isFallback
	                        ? Fallback
	                        : Page;
	    Object.setPrototypeOf(file, Prototype.prototype);

	    function Layout() { }
	    function Dir() { }
	    function Fallback() { }
	    function Page() { }
	    function PageDir() { }
	    function Reset() { }
	    function Root() { }
	});

	var miscPlugins = /*#__PURE__*/Object.freeze({
		__proto__: null,
		setRegex: setRegex,
		setParamKeys: setParamKeys,
		setShortPath: setShortPath,
		setRank: setRank,
		addMetaChildren: addMetaChildren,
		setIsIndexable: setIsIndexable,
		assignRelations: assignRelations,
		assignIndex: assignIndex,
		assignLayout: assignLayout,
		createFlatList: createFlatList,
		setPrototype: setPrototype
	});

	const assignAPI = createNodeMiddleware(({ file }) => {
	    file.api = new ClientApi(file);
	});

	class ClientApi {
	    constructor(file) {
	        this.__file = file;
	        Object.defineProperty(this, '__file', { enumerable: false });
	        this.isMeta = !!file.isMeta;
	        this.path = file.path;
	        this.title = _prettyName(file);
	        this.meta = file.meta;
	    }

	    get parent() { return !this.__file.root && this.__file.parent.api }
	    get children() {
	        return (this.__file.children || this.__file.isLayout && this.__file.parent.children || [])
	            .filter(c => !c.isNonIndexable)
	            .sort((a, b) => {
	                if(a.isMeta && b.isMeta) return 0
	                a = (a.meta.index || a.meta.title || a.path).toString();
	                b = (b.meta.index || b.meta.title || b.path).toString();
	                return a.localeCompare((b), undefined, { numeric: true, sensitivity: 'base' })
	            })
	            .map(({ api }) => api)
	    }
	    get next() { return _navigate(this, +1) }
	    get prev() { return _navigate(this, -1) }
	    preload() {
	        this.__file.layouts.forEach(file => file.component());
	        this.__file.component(); 
	    }
	}

	function _navigate(node, direction) {
	    if (!node.__file.root) {
	        const siblings = node.parent.children;
	        const index = siblings.indexOf(node);
	        return node.parent.children[index + direction]
	    }
	}


	function _prettyName(file) {
	    if (typeof file.meta.title !== 'undefined') return file.meta.title
	    else return (file.shortPath || file.path)
	        .split('/')
	        .pop()
	        .replace(/-/g, ' ')
	}

	const plugins = {...miscPlugins, assignAPI};

	function buildClientTree(tree) {
	  const order = [
	    // pages
	    "setParamKeys", //pages only
	    "setRegex", //pages only
	    "setShortPath", //pages only
	    "setRank", //pages only
	    "assignLayout", //pages only,
	    // all
	    "setPrototype",
	    "addMetaChildren",
	    "assignRelations", //all (except meta components?)
	    "setIsIndexable", //all
	    "assignIndex", //all
	    "assignAPI", //all
	    // routes
	    "createFlatList"
	  ];

	  const payload = { tree, routes: [] };
	  for (let name of order) {
	    const syncFn = plugins[name].sync || plugins[name];
	    syncFn(payload);
	  }
	  return payload
	}

	/* src\pages\_fallback.svelte generated by Svelte v4.2.1 */
	const file$1 = "src\\pages\\_fallback.svelte";

	function create_fragment$2(ctx) {
		let section;
		let div1;
		let div0;
		let h1;
		let t1;
		let p0;
		let t3;
		let p1;
		let t5;
		let a;
		let t6;
		let a_href_value;

		const block = {
			c: function create() {
				section = element("section");
				div1 = element("div");
				div0 = element("div");
				h1 = element("h1");
				h1.textContent = "404";
				t1 = space();
				p0 = element("p");
				p0.textContent = "Something's missing.";
				t3 = space();
				p1 = element("p");
				p1.textContent = "Sorry, we can't find that page. You'll find lots to explore on the home\r\n        page.";
				t5 = space();
				a = element("a");
				t6 = text("Back to Homepage");
				attr_dev(h1, "class", "mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-blue-600 dark:text-blue-500");
				add_location(h1, file$1, 7, 6, 241);
				attr_dev(p0, "class", "mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white");
				add_location(p0, file$1, 12, 6, 393);
				attr_dev(p1, "class", "mb-4 text-lg font-light text-gray-500 dark:text-gray-400");
				add_location(p1, file$1, 17, 6, 552);
				attr_dev(a, "href", a_href_value = /*$url*/ ctx[0]('/'));
				attr_dev(a, "class", "transition-all duration-300 ease-in-out inline-flex text-white bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-blue-900 my-4");
				add_location(a, file$1, 21, 6, 736);
				attr_dev(div0, "class", "mx-auto max-w-screen-sm text-center");
				add_location(div0, file$1, 6, 4, 184);
				attr_dev(div1, "class", "py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6");
				add_location(div1, file$1, 5, 2, 114);
				attr_dev(section, "class", "bg-white dark:bg-gray-900");
				add_location(section, file$1, 4, 0, 67);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, section, anchor);
				append_dev(section, div1);
				append_dev(div1, div0);
				append_dev(div0, h1);
				append_dev(div0, t1);
				append_dev(div0, p0);
				append_dev(div0, t3);
				append_dev(div0, p1);
				append_dev(div0, t5);
				append_dev(div0, a);
				append_dev(a, t6);
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*$url*/ 1 && a_href_value !== (a_href_value = /*$url*/ ctx[0]('/'))) {
					attr_dev(a, "href", a_href_value);
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(section);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$2.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$2($$self, $$props, $$invalidate) {
		let $url;
		validate_store(url, 'url');
		component_subscribe($$self, url, $$value => $$invalidate(0, $url = $$value));
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Fallback', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Fallback> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({ url, $url });
		return [$url];
	}

	class Fallback extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init$1(this, options, instance$2, create_fragment$2, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Fallback",
				options,
				id: create_fragment$2.name
			});
		}
	}

	/* src\pages\index.svelte generated by Svelte v4.2.1 */
	const file = "src\\pages\\index.svelte";

	function create_fragment$1(ctx) {
		let main;
		let h1;
		let t1;
		let p;
		let t2;
		let a;
		let t4;

		const block = {
			c: function create() {
				main = element("main");
				h1 = element("h1");
				h1.textContent = "Hello World!";
				t1 = space();
				p = element("p");
				t2 = text("Visit the ");
				a = element("a");
				a.textContent = "Svelte tutorial";
				t4 = text(" to learn\r\n    how to build Svelte apps.");
				add_location(h1, file, 1, 2, 10);
				attr_dev(a, "href", "https://svelte.dev/tutorial");
				add_location(a, file, 3, 14, 54);
				add_location(p, file, 2, 2, 35);
				add_location(main, file, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, main, anchor);
				append_dev(main, h1);
				append_dev(main, t1);
				append_dev(main, p);
				append_dev(p, t2);
				append_dev(p, a);
				append_dev(p, t4);
			},
			p: noop,
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(main);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$1.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$1($$self, $$props) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Pages', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Pages> was created with unknown prop '${key}'`);
		});

		return [];
	}

	class Pages extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init$1(this, options, instance$1, create_fragment$1, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Pages",
				options,
				id: create_fragment$1.name
			});
		}
	}

	//tree
	const _tree = {
	  "name": "root",
	  "filepath": "/",
	  "root": true,
	  "ownMeta": {},
	  "absolutePath": "src/pages",
	  "children": [
	    {
	      "isFile": true,
	      "isDir": false,
	      "file": "_fallback.svelte",
	      "filepath": "/_fallback.svelte",
	      "name": "_fallback",
	      "ext": "svelte",
	      "badExt": false,
	      "absolutePath": "D:/Users/mailp/Desktop/template-nestjs-svelte-tailwind-rollup/src/pages/_fallback.svelte",
	      "importPath": "../../../../src/pages/_fallback.svelte",
	      "isLayout": false,
	      "isReset": false,
	      "isIndex": false,
	      "isFallback": true,
	      "isPage": false,
	      "ownMeta": {},
	      "meta": {
	        "preload": false,
	        "prerender": true,
	        "precache-order": false,
	        "precache-proximity": true,
	        "recursive": true
	      },
	      "path": "/_fallback",
	      "id": "__fallback",
	      "component": () => Fallback
	    },
	    {
	      "isFile": true,
	      "isDir": false,
	      "file": "index.svelte",
	      "filepath": "/index.svelte",
	      "name": "index",
	      "ext": "svelte",
	      "badExt": false,
	      "absolutePath": "D:/Users/mailp/Desktop/template-nestjs-svelte-tailwind-rollup/src/pages/index.svelte",
	      "importPath": "../../../../src/pages/index.svelte",
	      "isLayout": false,
	      "isReset": false,
	      "isIndex": true,
	      "isFallback": false,
	      "isPage": true,
	      "ownMeta": {},
	      "meta": {
	        "preload": false,
	        "prerender": true,
	        "precache-order": false,
	        "precache-proximity": true,
	        "recursive": true
	      },
	      "path": "/index",
	      "id": "_index",
	      "component": () => Pages
	    }
	  ],
	  "isLayout": false,
	  "isReset": false,
	  "isIndex": false,
	  "isFallback": false,
	  "meta": {
	    "preload": false,
	    "prerender": true,
	    "precache-order": false,
	    "precache-proximity": true,
	    "recursive": true
	  },
	  "path": "/"
	};


	const {tree, routes} = buildClientTree(_tree);

	/* src\svelte\App.svelte generated by Svelte v4.2.1 */

	function create_fragment(ctx) {
		let router;
		let current;
		router = new Router({ props: { routes }, $$inline: true });

		const block = {
			c: function create() {
				create_component(router.$$.fragment);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				mount_component(router, target, anchor);
				current = true;
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(router.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(router.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(router, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('App', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({ Router, routes });
		return [];
	}

	class App extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init$1(this, options, instance, create_fragment, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "App",
				options,
				id: create_fragment.name
			});
		}
	}

	var main = new App({ target: document.body });

	return main;

})();
//# sourceMappingURL=bundle.js.map
