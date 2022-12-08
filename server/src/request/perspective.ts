import striptags from "striptags";

const COMMENT_ANALYZER_URL = "https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze";
const MAX_LENGTH = 20480;

export class PerspectiveAPIClientError extends Error {
  constructor(message: string) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = "PerspectiveAPIClientError";
  }
}

export class TextEmptyError extends PerspectiveAPIClientError {
  constructor() {
    super("text must not be empty");
    this.name = "TextEmptyError";
  }
}

export class TextTooLongError extends PerspectiveAPIClientError {
  constructor() {
    super(`text must not be greater than ${MAX_LENGTH} characters in length`);
    this.name = "TextTooLongError";
  }
}

export class ResponseError extends PerspectiveAPIClientError {
  response: Response;
  constructor(message: string, response: Response) {
    super(message);
    this.response = response;
    this.name = "ResponseError";
  }
}

interface PerspectiveOptions {
  apiKey?: string;
}

interface Resource {
  comment: {
    text: string;
  };
  requestedAttributes?: RequestedAttributes;
  doNotStore?: boolean;
}

interface AnalyzeOptions {
  stripHTML?: boolean;
  truncate?: boolean;
  doNotStore?: boolean;
  validate?: boolean;
  attributes?: Attribute[] | RequestedAttributes;
}

type Attribute = "TOXICITY" | "SEVERE_TOXICITY" | "IDENTITY_ATTACK" | "INSULT" | "PROFANITY" | "THREAT";

type RequestedAttributes = {
  [key in Attribute]?: {
    scoreType?: "PROBABILITY" | "PERCENTAGE";
    scoreThreshold?: number;
  };
}

interface ErrorResponse {
  error: {
    message: string;
  };
}

interface PerspectiveResponse {
  attributeScores: {
    [key in Attribute]?: {
      spanScores: {
        begin: number;
        end: number;
        score: {
          value: number;
          type: "PROBABILITY" | "PERCENTAGE";
        };
      }[];
      summaryScore: {
        value: number;
        type: "PROBABILITY" | "PERCENTAGE";
      };
    };
  };
}

class Perspective {
  options: PerspectiveOptions;
  constructor(options: PerspectiveOptions) {
    this.options = options || {};
    if (!this.options.apiKey) {
      throw new Error("Must provide options.apiKey");
    }
  }

  analyze(text: string | Resource, options?: AnalyzeOptions) {
    return new Promise((resolve, reject) => {
      let resource;
      try {
        resource = this.getAnalyzeCommentPayload(text, options);
      } catch (error) {
        reject(error);
      }
      fetch(`${COMMENT_ANALYZER_URL}?key=${encodeURIComponent(this.options.apiKey)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(resource),
      }).then(response => {
        response.json().then(json => {
          if (response.ok) {
            resolve(json as PerspectiveResponse);
          } else {
            reject(new ResponseError((json as ErrorResponse).error.message, response));
          }
        }).catch(error => {
          reject(error);
        });
      }).catch(error => {
        reject(error);
      });
    }) as Promise<PerspectiveResponse>;
  }

  getAnalyzeCommentPayload(text: string | Resource, options: AnalyzeOptions = {}): Resource {
    const stripHTML = options.stripHTML == undefined ? true : options.stripHTML;
    const truncate = options.truncate == undefined ? false : options.truncate;
    const doNotStore = options.doNotStore == undefined ? true : options.doNotStore;
    const validate = options.validate == undefined ? true : options.validate;
    const processText = (str: string) => {
      const ret = stripHTML ? striptags(str) : str;
      if (validate && !ret) {
        throw new TextEmptyError();
      }
      if (validate && !truncate && ret.length > MAX_LENGTH) {
        throw new TextTooLongError();
      }
      return truncate ? ret.substring(0, MAX_LENGTH) : ret;
    };
    let resource: Resource = typeof text === "object" ? text : { comment: { text } };
    resource.comment.text = processText(resource.comment.text);
    let attributes: Attribute[] | RequestedAttributes = resource.requestedAttributes || options.attributes || { TOXICITY: {} };
    let attributesFinal: RequestedAttributes = Array.isArray(attributes) ? attributes.reduce((acc, attr) => ({ ...acc, [attr]: {} }), {}) : attributes;
    return Object.assign({}, resource, {
      requestedAttributes: attributesFinal,
      doNotStore,
    });
  }
}

export default Perspective;
