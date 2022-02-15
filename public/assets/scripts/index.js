import AudioPlayer from './components/AudioPlayer';

class Application {
  _AudioPlayer = new AudioPlayer();

  constructor() {
    this._musicController = document.querySelector('.app-actions__music');
  }

  run() {
    this._musicController.addEventListener(
      'click',
      this.musicController.bind(this)
    );
  }

  musicController() {
    if (this._musicController.dataset.music === 'off') {
      this._AudioPlayer.play();
      this._musicController.dataset.music = 'on';

      this._musicController.children[0].src = 'assets/images/MusicResumed.svg';
      return;
    }
    if (this._musicController.dataset.music === 'on') {
      this._AudioPlayer.pause();
      this._musicController.dataset.music = 'off';
      this._musicController.children[0].src = 'assets/images/MusicPaused.svg';
    }
  }
}

class Initiallizer {
  static init() {
    const App = new Application();
    App.run();
  }
}

Initiallizer.init();
