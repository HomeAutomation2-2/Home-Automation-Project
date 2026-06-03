
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/(app)" | "/" | "/(app)/access" | "/add-room" | "/add-temp-program" | "/add-user" | "/(app)/dashboard" | "/(app)/dashboard/temps" | "/login" | "/login/select-account" | "/login/select-server" | "/manage-user" | "/manage-user/[id]" | "/(app)/my-home" | "/(app)/my-home/logs" | "/(app)/my-home/presence" | "/(app)/my-home/temps" | "/room" | "/room/[id]";
		RouteParams(): {
			"/manage-user/[id]": { id: string };
			"/room/[id]": { id: string }
		};
		LayoutParams(): {
			"/(app)": Record<string, never>;
			"/": { id?: string | undefined };
			"/(app)/access": Record<string, never>;
			"/add-room": Record<string, never>;
			"/add-temp-program": Record<string, never>;
			"/add-user": Record<string, never>;
			"/(app)/dashboard": Record<string, never>;
			"/(app)/dashboard/temps": Record<string, never>;
			"/login": Record<string, never>;
			"/login/select-account": Record<string, never>;
			"/login/select-server": Record<string, never>;
			"/manage-user": { id?: string | undefined };
			"/manage-user/[id]": { id: string };
			"/(app)/my-home": Record<string, never>;
			"/(app)/my-home/logs": Record<string, never>;
			"/(app)/my-home/presence": Record<string, never>;
			"/(app)/my-home/temps": Record<string, never>;
			"/room": { id?: string | undefined };
			"/room/[id]": { id: string }
		};
		Pathname(): "/" | "/access" | "/add-room" | "/add-temp-program" | "/add-user" | "/dashboard" | "/dashboard/temps" | "/login/select-account" | "/login/select-server" | `/manage-user/${string}` & {} | "/my-home" | "/my-home/logs" | "/my-home/presence" | "/my-home/temps" | `/room/${string}` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/InterVariable-Italic.woff2" | "/InterVariable.woff2" | "/robots.txt" | "/styles.css" | string & {};
	}
}