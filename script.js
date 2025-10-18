var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
(function () {
    // Avoid multiple instances running: 
    if (window.hasRun === true)
        return true;
    window.hasRun = true;
    const CONTAINER = document.documentElement || document.body;
    // Api key is passed from extension via message
    let API_KEY = localStorage.getItem("sadCaptchaKey");
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.apiKey !== null) {
            console.log("Api key: " + request.apiKey);
            API_KEY = request.apiKey;
            localStorage.setItem("sadCaptchaKey", API_KEY);
            sendResponse({ message: "API key set.", success: 1 });
        }
        else {
            sendResponse({ message: "API key cannot be empty.", success: 0 });
        }
    });
    const CREDITS_URL = "https://sadpuzzles.com/api/v1/license/credits?licenseKey=";
    const ARCED_SLIDE_URL = "https://sadpuzzles.com/api/v1/temu-arced-slide?licenseKey=";
    const THREE_BY_THREE_URL = "https://sadpuzzles.com/api/v1/temu-three-by-three?licenseKey=";
    const PUZZLE_URL = "https://sadpuzzles.com/api/v1/puzzle?licenseKey=";
    const SEMANTIC_SHAPES_URL = "http://2.57.217.176/api/captcha/semantic-shapes?licenseKey=";
    const TWO_IMAGE_URL = "https://sadpuzzles.com/api/v1/temu-two-image?licenseKey=";
    const SWAP_TWO_URL = "https://sadpuzzles.com/api/v1/temu-swap-two?licenseKey=";
    const API_HEADERS = new Headers({ "Content-Type": "application/json" });
    const ELEMENTS_INSIDE_CHALLENGE_SELECTOR = "#Picture *";
    const ARCED_SLIDE_PUZZLE_IMAGE_SELECTOR = "#slider > img, img[class^=bgImg], div[style=\"width: 414px;\"] > div > img";
    const ARCED_SLIDE_PIECE_CONTAINER_SELECTOR = "#img-button, div[role=dialog] div[style^='position: relative'] div[style^='position: absolute;'], div[style=\"width: 414px;\"] > div:has(img)";
    const ARCED_SLIDE_PIECE_IMAGE_SELECTOR = "div[role=dialog] div[style^='position: relative'] div[style^='position: absolute;'] > img, div[style=\"width: 414px;\"] > div > img";
    const ARCED_SLIDE_BUTTON_SELECTOR = "#slide-button, div[class^=handleBar] div[style^='position: absolute'], div[style=\"width: 414px;\"] > div:has(svg._WEB2X55)";
    const ARCED_SLIDE_UNIQUE_IDENTIFIERS = [ARCED_SLIDE_PIECE_CONTAINER_SELECTOR, ".handleBar-vT4I5", ".vT4I57cQ", "div[style=\"width: 414px;\"] #slider", "div[style=\"width: 410px;\"] #slider"];
    const SWAP_TWO_IMAGE = "img[class^=pizzle-box-img]";
    const SWAP_TWO_REFRESH_BUTTON = "svg[class^=refreshSvg]";
    const SWAP_TWO_UNIQUE_IDENTIFIERS = [SWAP_TWO_IMAGE];
    const PUZZLE_BUTTON_SELECTOR = "#slide-button, div[class^=slide-btn]";
    const PUZZLE_PUZZLE_IMAGE_SELECTOR = "#slider > img, img[class^='slider-img-bg']";
    const PUZZLE_PIECE_IMAGE_SELECTOR = "#img-button > img, img[class^='block-img']";
    const PUZZLE_SLIDER_WRAPPER = ".slider-wrapper, #Slider";
    const PUZZLE_UNIQUE_IDENTIFIERS = ["#Slider"];
    var SEMANTIC_SHAPES_CHALLENGE_TEXT = ".questionDesc-3Idcd";
    var SEMANTIC_SHAPES_IMAGE = "#captchaImg";
    var SEMANTIC_SHAPES_REFRESH_BUTTON = ".text-gSdWn";
    var SEMANTIC_SHAPES_UNIQUE_IDENTIFIERS = [SEMANTIC_SHAPES_CHALLENGE_TEXT];
    var SEMANTIC_SHAPES_SUBMIT_BUTTON = ".primary-3rODZ";
    const THREE_BY_THREE_IMAGE = "img.loaded";
    const THREE_BY_THREE_TEXT = ".verifyDialog div[role=dialog]";
    const THREE_BY_THREE_CONFIRM_BUTTON = ".verifyDialog div[role=button]:has(span)";
    const THREE_BY_THREE_UNIQUE_IDENTIFIERS = ["#imageSemantics img.loaded"];
    const THREE_BY_THREE_CLOSE_BUTTON = "div[aria-label=close]";
    const TWO_IMAGE_FIRST_IMAGE = "div[class^=picWrap] div[class^=firstPic] #captchaImg";
    const TWO_IMAGE_SECOND_IMAGE = "div[class^=picWrap] div:not([class^=firstPic]) div:not([class^=firstPic]) #captchaImg";
    const TWO_IMAGE_CHALLENGE_TEXT = "#verification div[class^=subTitle]";
    const TWO_IMAGE_CONFIRM_BUTTON = "div[class^=btnWrap] div[role=button]";
    const TWO_IMAGE_REFRESH_BUTTON = "svg[class^=refreshIcon]";
    const TWO_IMAGE_UNIQUE_IDENTIFIERS = [TWO_IMAGE_FIRST_IMAGE, TWO_IMAGE_SECOND_IMAGE];
    const CAPTCHA_PRESENCE_INDICATORS = [
        ARCED_SLIDE_PIECE_CONTAINER_SELECTOR,
        ARCED_SLIDE_BUTTON_SELECTOR,
        "#slide-button",
        "#Slider",
        "#slider",
        "iframe",
        "#imageSemantics",
        SEMANTIC_SHAPES_IMAGE,
        ".iframe-3eaNR",
        ".iframe-8Vtge",
        "#captchaImg",
    ];
    let CaptchaType;
    (function (CaptchaType) {
        CaptchaType[CaptchaType["PUZZLE"] = 0] = "PUZZLE";
        CaptchaType[CaptchaType["ARCED_SLIDE"] = 1] = "ARCED_SLIDE";
        CaptchaType[CaptchaType["SEMANTIC_SHAPES"] = 2] = "SEMANTIC_SHAPES";
        CaptchaType[CaptchaType["THREE_BY_THREE"] = 3] = "THREE_BY_THREE";
        CaptchaType[CaptchaType["SWAP_TWO"] = 4] = "SWAP_TWO";
        CaptchaType[CaptchaType["TWO_IMAGE"] = 5] = "TWO_IMAGE";
    })(CaptchaType || (CaptchaType = {}));
    function findFirstElementToAppear(selectors) {
        return new Promise(resolve => {
            const observer = new MutationObserver(mutations => {
                for (const mutation of mutations) {
                    if (mutation.addedNodes === null)
                        continue;
                    let addedNode = [];
                    mutation.addedNodes.forEach(node => addedNode.push(node));
                    for (const node of addedNode)
                        for (const selector of selectors) {
                            if (node instanceof HTMLIFrameElement) {
                                let iframe = node;
                                setTimeout(() => {
                                    let iframeElement = iframe.contentWindow.document.body.querySelector(selector);
                                    if (iframeElement) {
                                        console.debug(`element matched ${selector} in iframe`);
                                        observer.disconnect();
                                        console.dir(iframeElement);
                                        return resolve(iframeElement);
                                    }
                                }, 3000);
                            }
                            else if (node instanceof Element) {
                                let element = node;
                                if (element.querySelector(selector)) {
                                    console.debug(`element matched ${selector}`);
                                    observer.disconnect();
                                    console.dir(element);
                                    return resolve(element);
                                }
                            }
                        }
                }
            });
            observer.observe(CONTAINER, {
                childList: true,
                subtree: true
            });
        });
    }
    function waitForElement(selector) {
        return new Promise(resolve => {
            console.log("checking for " + selector);
            if (document.querySelector(selector)) {
                console.log("Selector found: " + selector);
                return resolve(document.querySelector(selector));
            }
            else if (document.querySelector("iframe")) {
                console.log("checking in iframe...");
                let iframe = document.querySelector("iframe");
                let ele = iframe.contentWindow.document.querySelector(selector);
                if (ele) {
                    console.log("Selector found: " + selector);
                    return resolve(ele);
                }
                else {
                    console.log("no element found in iframe: " + selector);
                }
            }
            else {
                const observer = new MutationObserver(_ => {
                    if (document.querySelector(selector)) {
                        observer.disconnect();
                        console.log("Selector found by mutation observer: " + selector);
                        return resolve(document.querySelector(selector));
                    }
                    let iframe = document.querySelector("iframe");
                    let ele = iframe.contentWindow.document.querySelector(selector);
                    if (ele) {
                        observer.disconnect();
                        console.log("Selector found by mutation observer: " + selector);
                        return resolve(ele);
                    }
                });
                console.log("created mutation observer");
                observer.observe(CONTAINER, {
                    childList: true,
                    subtree: true
                });
            }
        });
    }
    function waitForAllElements(selector) {
        return new Promise(resolve => {
            console.log("checking for " + selector);
            if (document.querySelector(selector)) {
                console.log("Selector found: " + selector);
                return resolve(document.querySelectorAll(selector));
            }
            else if (document.querySelector("iframe")) {
                console.log("checking in iframe...");
                let iframe = document.querySelector("iframe");
                let ele = iframe.contentWindow.document.querySelectorAll(selector);
                if (ele) {
                    console.log("Selector found: " + selector);
                    return resolve(ele);
                }
            }
            else {
                const observer = new MutationObserver(_ => {
                    if (document.querySelector(selector)) {
                        observer.disconnect();
                        console.log("Selector found by mutation observer: " + selector);
                        return resolve(document.querySelectorAll(selector));
                    }
                    let iframe = document.querySelector("iframe");
                    let ele = iframe.contentWindow.document.querySelectorAll(selector);
                    if (ele) {
                        observer.disconnect();
                        console.log("Selector found by mutation observer: " + selector);
                        return resolve(ele);
                    }
                });
                console.log("created mutation observer");
                observer.observe(CONTAINER, {
                    childList: true,
                    subtree: true
                });
            }
        });
    }
    function getTextContent(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            let ele = yield waitForElement(selector);
            let text = ele.textContent;
            console.log(`text of ${selector}: ${text}`);
            return text;
        });
    }
    function creditsApiCall() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("making api call");
            let resp = yield fetch(CREDITS_URL + API_KEY, {
                method: "GET",
                headers: API_HEADERS,
            });
            let credits = (yield resp.json()).credits;
            console.log("api credits = " + credits);
            return credits;
        });
    }
    function apiCall(url, body) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("making api call");
            let resp = yield fetch(url + API_KEY, {
                method: "POST",
                headers: API_HEADERS,
                body: JSON.stringify(body)
            });
            console.log("got api response:");
            console.log(resp);
            if (resp.status >= 400) {
                throw new Error("API error: " + resp.text());
            }
            return resp;
        });
    }
    function threeByThreeApiCall(requestBody) {
        return __awaiter(this, void 0, void 0, function* () {
            let resp = yield apiCall(THREE_BY_THREE_URL, requestBody);
            console.dir("got resp to 3x3 api call: ");
            console.dir(resp);
            return resp.json();
        });
    }
    function arcedSlideApiCall(requestBody) {
        return __awaiter(this, void 0, void 0, function* () {
            let resp = yield apiCall(ARCED_SLIDE_URL, requestBody);
            let pixelsFromSliderOrigin = (yield resp.json()).pixelsFromSliderOrigin;
            console.log("pixels from slider origin = " + pixelsFromSliderOrigin);
            return pixelsFromSliderOrigin;
        });
    }
    function puzzleApiCall(puzzleB64, pieceB64) {
        return __awaiter(this, void 0, void 0, function* () {
            let resp = yield apiCall(PUZZLE_URL, {
                puzzleImageB64: puzzleB64,
                pieceImageB64: pieceB64
            });
            let slideXProportion = (yield resp.json()).slideXProportion;
            console.log("slideXProportion = " + slideXProportion);
            return slideXProportion;
        });
    }
    function swapTwoApiCall(imageB64) {
        return __awaiter(this, void 0, void 0, function* () {
            let resp = yield apiCall(SWAP_TWO_URL, {
                imageB64: imageB64
            });
            let data = yield resp.json();
            return data;
        });
    }
    function semanticShapesApiCall(challenge, imageB64) {
        return __awaiter(this, void 0, void 0, function* () {
            let resp = yield apiCall(SEMANTIC_SHAPES_URL, {
                challenge: challenge,
                imageB64: imageB64
            });
            let data = yield resp.json();
            return data;
        });
    }
    function twoImageApiCall(requestBody) {
        return __awaiter(this, void 0, void 0, function* () {
            let resp = yield apiCall(TWO_IMAGE_URL, requestBody);
            let data = yield resp.json();
            return data;
        });
    }
    function anySelectorInListPresent(selectors) {
        for (const selector of selectors) {
            let ele = document.querySelector(selector);
            if (ele) {
                console.log(`selector ${selector} is present`);
                return true;
            }
            let iframe = document.querySelector("iframe");
            if (iframe) {
                console.log("checking for selector in iframe");
                ele = iframe.contentWindow.document.body.querySelector(selector);
                if (ele) {
                    console.log("Selector is present in iframe: " + selector);
                    return true;
                }
            }
        }
        console.log(`no selector in list is present`);
        return false;
    }
    function identifyCaptcha() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < 30; i++) {
                if (anySelectorInListPresent(ARCED_SLIDE_UNIQUE_IDENTIFIERS)) {
                    console.log("arced slide detected");
                    return CaptchaType.ARCED_SLIDE;
                }
                else if (anySelectorInListPresent(PUZZLE_UNIQUE_IDENTIFIERS)) {
                    console.log("puzzle detected");
                    return CaptchaType.PUZZLE;
                }
                else if (anySelectorInListPresent(SEMANTIC_SHAPES_UNIQUE_IDENTIFIERS)) {
                    console.log("semantic shapes detected");
                    return CaptchaType.SEMANTIC_SHAPES;
                }
                else if (anySelectorInListPresent(TWO_IMAGE_UNIQUE_IDENTIFIERS)) {
                    console.log("two image detected");
                    return CaptchaType.TWO_IMAGE;
                }
                else if (anySelectorInListPresent(THREE_BY_THREE_UNIQUE_IDENTIFIERS)) {
                    console.log("3x3 detected");
                    return CaptchaType.THREE_BY_THREE;
                }
                else if (anySelectorInListPresent(SWAP_TWO_UNIQUE_IDENTIFIERS)) {
                    console.log("swap two detected");
                    return CaptchaType.SWAP_TWO;
                }
                else {
                    yield new Promise(r => setTimeout(r, 1000));
                }
            }
            throw new Error("Could not identify CaptchaType");
        });
    }
    function getImageSource(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            let ele = yield waitForElement(selector);
            let src = ele.getAttribute("src");
            console.log("src = " + selector);
            return src;
        });
    }
    function getBase64StringFromDataURL(dataUrl) {
        let img = dataUrl.replace('data:', '').replace(/^.+,/, '');
        console.log("got b64 string from data URL");
        return img;
    }
    function mouseUp(x, y) {
        CONTAINER.dispatchEvent(new MouseEvent("mouseup", {
            bubbles: true,
            clientX: x,
            clientY: y
        }));
        console.log("mouse up at " + x + ", " + y);
    }
    function mouseOver(x, y) {
        let underMouse = document.elementFromPoint(x, y);
        underMouse.dispatchEvent(new MouseEvent("mouseover", {
            cancelable: true,
            bubbles: true,
            clientX: x,
            clientY: y
        }));
        console.log("mouse over at " + x + ", " + y);
    }
    function mouseDragStart(x, y) {
        let underMouse = document.elementFromPoint(x, y);
        underMouse.dispatchEvent(new MouseEvent("dragstart", {
            cancelable: true,
            bubbles: true,
            clientX: x,
            clientY: y
        }));
        console.log("mouse drag start at " + x + ", " + y);
    }
    function mouseDrag(x, y) {
        let underMouse = document.elementFromPoint(x, y);
        underMouse.dispatchEvent(new MouseEvent("drag", {
            cancelable: true,
            bubbles: true,
            clientX: x,
            clientY: y
        }));
        console.log("mouse drag at " + x + ", " + y);
    }
    function mouseDragEnd(x, y) {
        let underMouse = document.elementFromPoint(x, y);
        underMouse.dispatchEvent(new MouseEvent("dragend", {
            cancelable: true,
            bubbles: true,
            clientX: x,
            clientY: y
        }));
        console.log("mouse drag end at " + x + ", " + y);
    }
    function mouseDown(x, y) {
        let underMouse = document.elementFromPoint(x, y);
        underMouse.dispatchEvent(new MouseEvent("mousedown", {
            cancelable: true,
            bubbles: true,
            clientX: x,
            clientY: y
        }));
        console.log("mouse down at " + x + ", " + y);
    }
    function mouseEnterPage() {
        let width = window.innerWidth;
        let centerX = window.innerWidth / 2;
        let centerY = window.innerHeight / 2;
        CONTAINER.dispatchEvent(new PointerEvent("pointerover", {
            pointerType: "mouse",
            cancelable: true,
            bubbles: true,
            clientX: width,
            clientY: centerY
        }));
        CONTAINER.dispatchEvent(new MouseEvent("mouseover", {
            cancelable: true,
            bubbles: true,
            clientX: width,
            clientY: centerY
        }));
        for (let i = 0; i < centerX; i++) {
            mouseMove(width - i, centerY);
        }
    }
    function randomMouseMovement() {
        let randomX = Math.round(window.innerWidth * Math.random());
        let randomY = Math.round(window.innerHeight * Math.random());
        try {
            mouseMove(randomX, randomX);
            mouseOver(randomX, randomY);
        }
        catch (err) {
            console.log("error doing random mouse movement: ");
            console.log(err);
        }
    }
    function mouseMove(x, y, ele) {
        let c;
        if (ele === undefined) {
            c = CONTAINER;
        }
        else {
            c = ele;
        }
        c.dispatchEvent(new PointerEvent("mousemove", {
            pointerType: "mouse",
            cancelable: true,
            bubbles: true,
            clientX: x,
            clientY: y
        }));
        console.log("moved mouse to " + x + ", " + y);
    }
    /*
        * Dispatch a simple mouseclick event.
        * No x or y, no mouseup or mousedown.
        * Just mouseclick
    */
    function mouseClickSimple(element) {
        const clickEvent = new MouseEvent('click', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        element.dispatchEvent(clickEvent);
        console.log("simple clicked element");
    }
    /*
        * Dispatch full pipeline of mouseover, mousedown, mouseup, and mouseclick
    */
    function mouseClick(element, x, y) {
        element.dispatchEvent(new MouseEvent("mouseover", {
            bubbles: true,
            clientX: x,
            clientY: y
        }));
        setTimeout(() => null, 10);
        element.dispatchEvent(new MouseEvent("mousedown", {
            bubbles: true,
            clientX: x,
            clientY: y
        }));
        setTimeout(() => null, 200);
        element.dispatchEvent(new MouseEvent("mouseup", {
            bubbles: true,
            clientX: x,
            clientY: y
        }));
        element.dispatchEvent(new MouseEvent("mouseclick", {
            bubbles: true,
            clientX: x,
            clientY: y
        }));
    }
    function getElementCenter(element) {
        let rect = element.getBoundingClientRect();
        let center = {
            x: rect.x + (rect.width / 2),
            y: rect.y + (rect.height / 2),
        };
        console.log("element center: ");
        console.dir(center);
        return center;
    }
    function getElementWidth(element) {
        let rect = element.getBoundingClientRect();
        console.log("element width: " + rect.width);
        return rect.width;
    }
    function clickCenterOfElement(element) {
        let rect = element.getBoundingClientRect();
        let x = rect.x + (rect.width / 2);
        let y = rect.y + (rect.height / 2);
        mouseClick(element, x, y);
    }
    function clickProportional(element, proportionX, proportionY) {
        let boundingBox = element.getBoundingClientRect();
        let xOrigin = boundingBox.x;
        let yOrigin = boundingBox.y;
        let xOffset = (proportionX * boundingBox.width);
        let yOffset = (proportionY * boundingBox.height);
        let x = xOrigin + xOffset;
        let y = yOrigin + yOffset;
        console.log(`clicked at ${x}, ${y}`);
        mouseClick(element, x, y);
    }
    function dragProportional(element, points) {
        if (points.proportionalPoints.length !== 2) {
            throw new Error(`When dragging proportional, expected points to be 2. Got ${points.proportionalPoints.length}`);
        }
        let boundingBox = element.getBoundingClientRect();
        let p1 = points.proportionalPoints[0];
        let p2 = points.proportionalPoints[1];
        let startX = boundingBox.x + (p1.proportionX * boundingBox.width);
        let startY = boundingBox.y + (p1.proportionY * boundingBox.height);
        let endX = boundingBox.x + (p2.proportionX * boundingBox.width);
        let endY = boundingBox.y + (p2.proportionY * boundingBox.height);
        mouseOver(startX, startY);
        mouseDown(startX, startY);
        mouseDragStart(startX + 1, startY + 1);
        new Promise(r => setTimeout(r, 300)).then(value => null);
        mouseDrag(endX - 1, endY - 1);
        mouseOver(endX, endY);
        mouseUp(endX, endY);
        mouseDragEnd(endX, endY);
    }
    function computePuzzleSlideDistance(proportionX, puzzleImageEle) {
        let distance = puzzleImageEle.getBoundingClientRect().width * proportionX;
        console.log("puzzle slide distance = " + distance);
        return distance;
    }
    function solveSwapTwo() {
        return __awaiter(this, void 0, void 0, function* () {
            let src = yield getImageSource(SWAP_TWO_IMAGE);
            let img = getBase64StringFromDataURL(src);
            let solution = yield swapTwoApiCall(img);
            let imgEle = yield waitForElement(SWAP_TWO_IMAGE);
            dragProportional(imgEle, solution);
            yield new Promise(resolve => setTimeout(resolve, 3000));
            if (captchaIsPresent()) {
                console.log("captcha was still present, retrying");
                mouseClickSimple(yield waitForElement(SWAP_TWO_REFRESH_BUTTON));
                yield new Promise(resolve => setTimeout(resolve, 3000));
                yield solveSwapTwo();
            }
        });
    }
    function solveArcedSlide() {
        return __awaiter(this, void 0, void 0, function* () {
            let puzzleImageSrc = yield getImageSource(ARCED_SLIDE_PUZZLE_IMAGE_SELECTOR);
            let pieceImageSrc = yield getImageSource(ARCED_SLIDE_PIECE_IMAGE_SELECTOR);
            let puzzleImg = getBase64StringFromDataURL(puzzleImageSrc);
            let pieceImg = getBase64StringFromDataURL(pieceImageSrc);
            let slideButtonEle = yield waitForElement(ARCED_SLIDE_BUTTON_SELECTOR);
            const startX = getElementCenter(slideButtonEle).x;
            const startY = getElementCenter(slideButtonEle).y;
            let puzzleEle = yield waitForElement(ARCED_SLIDE_PUZZLE_IMAGE_SELECTOR);
            let trajectory = yield getSlidePieceTrajectory(slideButtonEle, puzzleEle);
            let solution = yield arcedSlideApiCall({
                piece_image_b64: pieceImg,
                puzzle_image_b64: puzzleImg,
                slide_piece_trajectory: trajectory
            });
            let currentX = getElementCenter(slideButtonEle).x;
            let currentY = getElementCenter(slideButtonEle).y;
            let solutionDistanceBackwards = currentX - startX - solution;
            console.log(solutionDistanceBackwards);
            let overshoot = 6;
            let mouseStep = 2;
            yield new Promise(r => setTimeout(r, 100));
            for (let pixel = 0; pixel < solutionDistanceBackwards; pixel += 1) {
                mouseMove(currentX - pixel, currentY - Math.log(pixel + 1), slideButtonEle);
                console.debug("current x: " + currentX);
                let pauseTime = (200 / (pixel + 1)) + (Math.random() * 5);
                yield new Promise(r => setTimeout(r, pauseTime));
            }
            yield new Promise(r => setTimeout(r, 300));
            mouseMove(startX + solution, startY);
            mouseUp(startX + solution, startY);
            yield new Promise(r => setTimeout(r, 3000));
        });
    }
    function getSlidePieceTrajectory(slideButton, puzzle) {
        return __awaiter(this, void 0, void 0, function* () {
            let sliderPieceContainer = yield waitForElement(ARCED_SLIDE_PIECE_CONTAINER_SELECTOR);
            console.log("got slider piece container");
            let slideBarWidth = getElementWidth(puzzle);
            console.log("slide bar width: " + slideBarWidth);
            let timesPieceDidNotMove = 0;
            let slideButtonCenter = getElementCenter(slideButton);
            let puzzleImageBoundingBox = puzzle.getBoundingClientRect();
            let trajectory = [];
            let mouseStep = 5;
            mouseEnterPage();
            mouseMove(slideButtonCenter.x, slideButtonCenter.y);
            mouseDown(slideButtonCenter.x, slideButtonCenter.y);
            slideButton.dispatchEvent(new MouseEvent("mousedown", {
                cancelable: true,
                bubbles: true,
                clientX: slideButtonCenter.x,
                clientY: slideButtonCenter.y
            }));
            for (let pixel = 0; pixel < slideBarWidth; pixel += mouseStep) {
                let pauseTime = (200 / (pixel + 1)) + (Math.random() * 5);
                yield new Promise(r => setTimeout(r, pauseTime));
                //moveMouseTo(slideButtonCenter.x + pixel, slideButtonCenter.y - pixel)
                slideButton.dispatchEvent(new MouseEvent("mousemove", {
                    cancelable: true,
                    bubbles: true,
                    clientX: slideButtonCenter.x + pixel,
                    clientY: slideButtonCenter.y - Math.log(pixel + 1)
                }));
                yield new Promise(r => setTimeout(r, 40));
                let trajectoryElement = getTrajectoryElement(pixel, puzzleImageBoundingBox, sliderPieceContainer);
                trajectory.push(trajectoryElement);
                if (trajectory.length < 100 / mouseStep)
                    continue;
                if (pieceIsNotMoving(trajectory))
                    timesPieceDidNotMove++;
                else
                    timesPieceDidNotMove = 0;
                if (timesPieceDidNotMove >= 10 / mouseStep)
                    break;
                console.log("trajectory element:");
                console.dir(trajectoryElement);
            }
            return trajectory;
        });
    }
    function getTrajectoryElement(currentSliderPixel, largeImgBoundingBox, sliderPiece) {
        let sliderPieceStyle = sliderPiece.getAttribute("style");
        let rotateAngle = rotateAngleFromStyle(sliderPieceStyle);
        let pieceCenter = getElementCenter(sliderPiece);
        let pieceCenterProp = xyToProportionalPoint(largeImgBoundingBox, pieceCenter); // This returns undefined
        let ele = {
            piece_center: pieceCenterProp,
            piece_rotation_angle: rotateAngle,
            pixels_from_slider_origin: currentSliderPixel
        };
        console.dir(ele);
        return ele;
    }
    function rotateAngleFromStyle(style) {
        let rotateRegex = /.*rotate\(|deg.*/gi;
        let rotateAngle;
        if (style.search(rotateRegex) === -1) {
            rotateAngle = 0;
        }
        else {
            let rotateStr = style.replace(rotateRegex, "");
            rotateAngle = parseFloat(rotateStr);
        }
        console.log("rotate angle: " + rotateAngle);
        return rotateAngle;
    }
    function pieceIsNotMoving(trajetory) {
        console.dir(trajetory);
        if (trajetory[trajetory.length - 1].piece_center.proportionX ==
            trajetory[trajetory.length - 2].piece_center.proportionX) {
            console.log("piece is not moving");
            return true;
        }
        else {
            console.log("piece is moving");
            return false;
        }
    }
    function xyToProportionalPoint(container, point) {
        let xInContainer = point.x - container.x;
        let yInContainer = point.y - container.y;
        return {
            proportionX: xInContainer / container.width,
            proportionY: yInContainer / container.height,
        };
    }
    function solvePuzzle() {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise(r => setTimeout(r, 3000));
            let sliderWrapper = yield waitForElement(PUZZLE_SLIDER_WRAPPER);
            let sliderButton = yield waitForElement(PUZZLE_BUTTON_SELECTOR);
            let wrapperCenter = getElementCenter(sliderWrapper);
            let buttonCenter = getElementCenter(sliderButton);
            let preRequestSlidePixels = 10;
            mouseEnterPage();
            for (let i = 0; i < 25; i++) {
                randomMouseMovement();
                setTimeout(() => null, 1.337);
            }
            mouseMove(wrapperCenter.x, wrapperCenter.y);
            mouseOver(wrapperCenter.x, wrapperCenter.y);
            yield new Promise(r => setTimeout(r, 133.7));
            mouseMove(buttonCenter.x, buttonCenter.y);
            mouseOver(buttonCenter.x, buttonCenter.y);
            yield new Promise(r => setTimeout(r, 133.7));
            mouseDown(buttonCenter.x, buttonCenter.y);
            yield new Promise(r => setTimeout(r, 133.7));
            for (let i = 1; i < preRequestSlidePixels; i++) {
                mouseMove(buttonCenter.x + i, buttonCenter.y - Math.log(i) + Math.random() * 3);
                yield new Promise(r => setTimeout(r, Math.random() * 5 + 10));
            }
            let puzzleSrc = yield getImageSource(PUZZLE_PUZZLE_IMAGE_SELECTOR);
            let pieceSrc = yield getImageSource(PUZZLE_PIECE_IMAGE_SELECTOR);
            console.log("got image sources");
            let puzzleImg = getBase64StringFromDataURL(puzzleSrc);
            let pieceImg = getBase64StringFromDataURL(pieceSrc);
            console.log("converted image sources to b64 string");
            let solution = yield puzzleApiCall(puzzleImg, pieceImg);
            console.log("got API result: " + solution);
            let puzzleImageEle = yield waitForElement(PUZZLE_PUZZLE_IMAGE_SELECTOR);
            let distance = computePuzzleSlideDistance(solution, puzzleImageEle);
            let currentX;
            let currentY;
            for (let i = 1; i < distance - preRequestSlidePixels; i += Math.random() * 5) {
                currentX = buttonCenter.x + i + preRequestSlidePixels;
                currentY = buttonCenter.y - Math.log(i) + Math.random() * 3;
                mouseMove(currentX, currentY);
                mouseOver(currentX, currentY);
                yield new Promise(r => setTimeout(r, Math.random() * 5 + 10));
            }
            yield new Promise(r => setTimeout(r, 133.7));
            mouseOver(buttonCenter.x + distance, buttonCenter.x - distance);
            yield new Promise(r => setTimeout(r, 133.7));
            mouseUp(buttonCenter.x + distance, buttonCenter.x - distance);
            yield new Promise(r => setTimeout(r, 3000));
        });
    }
    function refreshSemanticShapes() {
        return __awaiter(this, void 0, void 0, function* () {
            let srcBefore = yield getImageSource(SEMANTIC_SHAPES_IMAGE);
            mouseClickSimple(yield waitForElement(SEMANTIC_SHAPES_REFRESH_BUTTON));
            for (let i = 0; i < 10; i++) {
                if ((yield getImageSource(SEMANTIC_SHAPES_IMAGE)) === srcBefore) {
                    console.log("waiting for refresh...");
                    yield new Promise(r => setTimeout(r, 500));
                    continue;
                }
                else {
                    console.log("refresh complete");
                    return;
                }
            }
            throw new Error("clicked and waited for refresh, but refresh never happened");
        });
    }
    function solveSemanticShapes() {
        return __awaiter(this, void 0, void 0, function* () {
            mouseEnterPage();
            for (let i = 0; i < 25; i++) {
                randomMouseMovement();
                yield new Promise(resolve => setTimeout(resolve, 1.337));
            }
            let src = yield getImageSource(SEMANTIC_SHAPES_IMAGE);
            let img = getBase64StringFromDataURL(src);
            let challenge = yield getTextContent(SEMANTIC_SHAPES_CHALLENGE_TEXT);
            let res;
            try {
                res = yield semanticShapesApiCall(challenge, img);
            }
            catch (err) {
                console.log("Error calling semantic shapes API. refreshing and retrying");
                console.error(err);
                yield refreshSemanticShapes();
                yield solveSemanticShapes();
            }
            let ele = yield waitForElement(SEMANTIC_SHAPES_IMAGE);
            for (const point of res.proportionalPoints) {
                let countOfPointsBeforeClicking = yield countElementsInsideImageSemanticsChallenge();
                for (let i = 0; i < 5; i++) {
                    clickProportional(ele, point.proportionX + (i / 50), point.proportionY + (i / 50));
                    yield new Promise(resolve => setTimeout(resolve, 1337));
                    if (countOfPointsBeforeClicking === (yield countElementsInsideImageSemanticsChallenge())) {
                        console.log("count of elements inside challenge was the same after clicking. this means no red dot appeared. trying to click again");
                        continue;
                    }
                    else {
                        console.log("a new element appeared inside after clicking. continuing to click the rest of the points");
                        break;
                    }
                }
            }
            yield new Promise(r => setTimeout(r, 3000));
            mouseClickSimple(yield waitForElement(SEMANTIC_SHAPES_SUBMIT_BUTTON));
            if (captchaIsPresent()) {
                console.log("captcha was still present, retrying");
                yield refreshSemanticShapes();
                yield solveSemanticShapes();
            }
        });
    }
    function solveThreeByThree() {
        return __awaiter(this, void 0, void 0, function* () {
            let closeButton = yield waitForElement(THREE_BY_THREE_CLOSE_BUTTON);
            mouseClickSimple(closeButton);
            console.warn("three by three not implemented yet. closing captcha to wait for another to appear.");
            //let imageElements = await waitForAllElements(THREE_BY_THREE_IMAGE)
            //let imageB64 = []
            //imageElements.forEach(ele => {
            //	imageB64.push(getBase64StringFromDataURL(ele.getAttribute("src")))
            //})
            //let challengeText = await getTextContent(THREE_BY_THREE_TEXT)
            //let objects = parseThreeByThreeObjectsOfInterest(challengeText)
            //let request: ThreeByThreeCaptchaRequest = {
            //	objects_of_interest: objects,
            //	images: imageB64
            //}
            //let resp = await threeByThreeApiCall(request)
            //for (let i in resp.solution_indices) {
            //	let ele = await waitForElement(`img[src*="${imageB64[i]}"]`)	
            //	clickProportional(ele, 0.69, 0.69)
            //	setTimeout(() => null, 1337)
            //}
            //clickProportional(await waitForElement(THREE_BY_THREE_CONFIRM_BUTTON), 0.69, 0.420)
        });
    }
    function solveTwoImage() {
        return __awaiter(this, void 0, void 0, function* () {
            let challengeText = yield getTextContent(TWO_IMAGE_CHALLENGE_TEXT);
            let firstImage = getBase64StringFromDataURL(yield getImageSource(TWO_IMAGE_FIRST_IMAGE));
            let secondImage = getBase64StringFromDataURL(yield getImageSource(TWO_IMAGE_SECOND_IMAGE));
            let request = {
                challenge: challengeText,
                images_b64: [firstImage, secondImage]
            };
            let resp;
            try {
                resp = yield twoImageApiCall(request);
            }
            catch (err) {
                console.log("Error calling two image API. refreshing and retrying");
                console.error(err);
                mouseClickSimple(yield waitForElement(TWO_IMAGE_REFRESH_BUTTON));
                //await solveTwoImage()
            }
            let targetImageSelector = identifyTwoImageSelectorToClick(challengeText);
            let targetImage = yield waitForElement(targetImageSelector);
            for (const point of resp.proportionalPoints) {
                clickProportional(targetImage, point.proportionX, point.proportionY);
                yield new Promise(resolve => setTimeout(resolve, 1337));
            }
            mouseClickSimple(yield waitForElement(TWO_IMAGE_CONFIRM_BUTTON));
            yield new Promise(resolve => setTimeout(resolve, 3000));
            if (captchaIsPresent()) {
                console.log("captcha was still present, retrying");
                mouseClickSimple(yield waitForElement(TWO_IMAGE_REFRESH_BUTTON));
                yield new Promise(resolve => setTimeout(resolve, 3000));
                //await solveTwoImage()
            }
        });
    }
    function countElementsInsideImageSemanticsChallenge() {
        return __awaiter(this, void 0, void 0, function* () {
            let elements = yield waitForAllElements(ELEMENTS_INSIDE_CHALLENGE_SELECTOR);
            let count = elements.length;
            console.log(`${count} elements present in challenge`);
            return count;
        });
    }
    function identifyTwoImageSelectorToClick(challengeText) {
        let lowerText = challengeText.toLowerCase();
        let figure1Index = lowerText.indexOf("figure 1");
        let figure2index = lowerText.indexOf("figure 2");
        if (figure1Index === -1 || figure2index == -1) {
            throw new Error("Possible issue due to unsupported language. Currently only English is supported. Could not see 'figure 1' or 'figure 2' in challenge text");
        }
        if (figure1Index < figure2index) {
            console.log("challenge is asking us to click the first image");
            return TWO_IMAGE_FIRST_IMAGE;
        }
        else {
            console.log("challenge is asking us to click the second image");
            return TWO_IMAGE_SECOND_IMAGE;
        }
    }
    /*
    * Get the list of objects to select from Temu 3x3 captcha
    * ex:
    *     input: 'Click on the corresponding images in the following order: 'television','strawberry','peach'
    *     output: ['television', 'strawberry', 'peach']
    */
    function parseThreeByThreeObjectsOfInterest(challengeText) {
        let objects = challengeText.match(/(?<=')[\w\s]+?(?=')/g);
        console.log(`input text: ${challengeText}\nobjects of interest: ${objects}`);
        return objects;
    }
    function captchaIsPresent() {
        for (let i = 0; i < CAPTCHA_PRESENCE_INDICATORS.length; i++) {
            if (document.querySelector(CAPTCHA_PRESENCE_INDICATORS[i])) {
                console.log("captcha present based on selector: " + CAPTCHA_PRESENCE_INDICATORS[i]);
                return true;
            }
            if (document.querySelector("iframe")) {
                let iframe = document.querySelector("iframe");
                if (iframe.contentWindow.document.querySelector(CAPTCHA_PRESENCE_INDICATORS[i])) {
                    console.log("captcha present based on selector: " + CAPTCHA_PRESENCE_INDICATORS[i]);
                    return true;
                }
            }
        }
        console.log("captcha not present");
        return false;
    }
    let isCurrentSolve = false;
    function solveCaptchaLoop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!isCurrentSolve) {
                if (captchaIsPresent()) {
                    console.log("captcha detected by css selector");
                }
                else {
                    console.log("waiting for captcha");
                    const _ = yield findFirstElementToAppear(CAPTCHA_PRESENCE_INDICATORS);
                    console.log("captcha detected by mutation observer");
                }
                isCurrentSolve = true;
                let captchaType;
                try {
                    captchaType = yield identifyCaptcha();
                }
                catch (err) {
                    console.log("could not detect captcha type. restarting captcha loop");
                    isCurrentSolve = false;
                    yield solveCaptchaLoop();
                }
                try {
                    if ((yield creditsApiCall()) <= 0) {
                        console.log("out of credits");
                        alert("Out of SadCaptcha credits. Please boost your balance on sadcaptcha.com/dashboard.");
                        return;
                    }
                }
                catch (e) {
                    console.log("error making check credits api call");
                    console.error(e);
                    console.log("proceeding to attempt solution anyways");
                }
                try {
                    switch (captchaType) {
                        case CaptchaType.PUZZLE:
                            yield solvePuzzle();
                            break;
                        case CaptchaType.ARCED_SLIDE:
                            yield solveArcedSlide();
                            break;
                        case CaptchaType.SEMANTIC_SHAPES:
                            yield solveSemanticShapes();
                            break;
                        case CaptchaType.THREE_BY_THREE:
                            yield solveThreeByThree();
                            break;
                        case CaptchaType.TWO_IMAGE:
                            yield solveTwoImage();
                            break;
                        case CaptchaType.SWAP_TWO:
                            yield solveSwapTwo();
                            break;
                    }
                }
                catch (err) {
                    console.log("error solving captcha");
                    console.error(err);
                    console.log("restarting captcha loop");
                }
                finally {
                    isCurrentSolve = false;
                    yield new Promise(r => setTimeout(r, 5000));
                    yield solveCaptchaLoop();
                }
            }
        });
    }
    solveCaptchaLoop();
})();
//# sourceMappingURL=script.js.map