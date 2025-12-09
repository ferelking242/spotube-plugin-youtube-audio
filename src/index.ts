import { AudioSourceEndpoint } from "./segments/audio_source.js";
import { CorePlugin } from "./segments/core.js";

export class YouTubeAudioSourcePlugin {
	audioSource: AudioSourceEndpoint;
	core: CorePlugin;

	constructor() {
		this.audioSource = new AudioSourceEndpoint();
		this.core = new CorePlugin();
	}
}
