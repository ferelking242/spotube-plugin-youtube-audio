import {
	YouTubeEngine,
	type IAudioSourceEndpoint,
	type SpotubeAudioSourceContainerPreset,
	type SpotubeAudioSourceMatchObject,
	type SpotubeAudioSourceStreamObject,
	type SpotubeTrackObject,
} from "@spotube-app/plugin";

export class AudioSourceEndpoint implements IAudioSourceEndpoint {
	yt = new YouTubeEngine();

	async matches(
		track: SpotubeTrackObject,
	): Promise<SpotubeAudioSourceMatchObject[]> {
		const artists = track.artists.map((a) => a.name).join(", ");
		const hasISRC = track.isrc != null && track.isrc.length > 0;
		let res = await this.yt.search(
			hasISRC ? track.isrc : `${track.name} ${artists}`,
		);

		if (res.length === 0 && hasISRC) {
			res = await this.yt.search(`${track.name} ${artists}`);
		}

		return res.map((item) => {
			return {
				typeName: "audio_source_match",
				title: item.title,
				artists: [item.author],
				duration: item.duration ?? 0,
				externalUri: `https://www.youtube.com/watch?v=${item.id}`,
				id: item.id,
				thumbnail: null,
			};
		});
	}

	async streams(
		matched: SpotubeAudioSourceMatchObject,
	): Promise<SpotubeAudioSourceStreamObject[]> {
		const manifest = await this.yt.streamManifest(matched.id);

		return manifest.map((stream) => {
			return {
				typeName: "audio_source_stream",
				url: stream.url,
				container: stream.container,
				type: "lossless",
				codec: "aac",
				bitrate: stream.bitrate,
				bitDepth: null,
				sampleRate: null,
			};
		});
	}

	// List of containers and their supported qualities
	supportedPresets(): SpotubeAudioSourceContainerPreset[] {
		return [
			{
				type: "lossy",
				name: "mp4",
				qualities: [
					{ bitrate: 256000 },
					{ bitrate: 128000 },
					{ bitrate: 96000 },
					{ bitrate: 44000 },
				],
			},
			{
				type: "lossy",
				name: "webm",
				qualities: [
					{ bitrate: 256000 },
					{ bitrate: 128000 },
					{ bitrate: 96000 },
					{ bitrate: 44000 },
				],
			},
		];
	}
}
