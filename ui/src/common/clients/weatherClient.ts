export default class WeatherClient {
  url: string;

  constructor(url: string) {
    this.url = url;
  }

  helloWorld(): Promise<string> {
    return fetch(`${this.url}/api/helloworld`).then((res) => res.text());
  }
}
