// @ts-check
import tseslint from "typescript-eslint";

export default tseslint.config(
	{
		ignores: ["dist/**", "node_modules/**", "bin/**"],
	},
	...tseslint.configs.recommended,
	{
		files: ["src/**/*.ts"],
		rules: {
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{ argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
			],
		},
	},
	{
		files: ["src/pi-types.d.ts"],
		rules: {
			// Type shim for an external runtime module we don't control the
			// signatures of — any is unavoidable here, not a public API surface.
			"@typescript-eslint/no-explicit-any": "off",
		},
	},
);
