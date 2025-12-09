import type {
	ICoreEndpoint,
	PluginConfiguration,
	PluginUpdateAvailable,
	ScrobbleDetails,
} from "@spotube-app/plugin";
import semver from "semver";

class CorePlugin implements ICoreEndpoint {

	async scrobble(_details: ScrobbleDetails): Promise<void> {
		return;
	}

	async checkUpdate(
		currentConfig: PluginConfiguration,
	): Promise<PluginUpdateAvailable | null> {
		const parsed = semver.parse(currentConfig.version);

		if (!parsed) {
			return Promise.reject(
				"Invalid version format in current plugin configuration.",
			);
		}

		const data = await fetch(
			"https://api.github.com/repos/KRTirtho/spotube-plugin-youtube-audio/releases/latest",
			{
				headers: {
					Accept: "application/vnd.github.v3+json",
				},
			},
		).then(
			(res) =>
				res.json() as Promise<{
					tag_name: string;
					body: string | undefined;
					assets: { name: string; browser_download_url: string }[];
				}>,
		);
		const latestVersion = semver.parse(data.tag_name);
		if (!latestVersion) {
			throw new Error(
				`Invalid version format from GitHub API. Expected format: <major>.<minor>.<patch>. Got: ${data.tag_name}`,
			);
		}

		const isUpdateAvailable = semver.gt(latestVersion, parsed);
		if (!isUpdateAvailable) return null;

		const pluginFileAsset = data.assets.find(
			(asset) => asset.name === "plugin.smplug",
		);
		if (
			pluginFileAsset == null ||
			pluginFileAsset.browser_download_url == null
		) {
			throw "No download URL found for the plugin update";
		}
		const changelog = data.body ?? "No changelog available";
		return {
			downloadUrl: pluginFileAsset.browser_download_url,
			version: data.tag_name,
			changelog: changelog,
		};
	}

	/// Returns the support information for the plugin in Markdown or plain text.
	/// Supports images and links.
	support(): string {
		return `
# Support

This project and lots of other projects use the following:

- [yt-dlp](https://github.com/yt-dlp/yt-dlp)
- [NewPipe](https://github.com/TeamNewPipe) 
- [youtube_explode_dart](https://github.com/Hexer10/youtube_explode_dart)

These are extremely hard to maintain projects as YouTube is constantly changing their APIs every week, making it
harder and harder to reverse engineer their protocols and retrieving audio/video streams. So please contribute to 
those projects financially or technically, however you can if you have the ability to do so.

## Financial donation links
- yt-dlp: [github.com/yt-dlp/yt-dlp/blob/master/Maintainers.md](https://github.com/yt-dlp/yt-dlp/blob/master/Maintainers.md#maintainers)
- NewPipe: [newpipe.net/donate](https://newpipe.net/donate/)
- YoutubeExplodeDart: [github.com/sponsors/Hexer10](https://github.com/sponsors/Hexer10)
`;
	}
}

export { CorePlugin };
