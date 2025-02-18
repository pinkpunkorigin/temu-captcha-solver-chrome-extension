interface Request {
	apiKey: string
}

(function() {

	// Avoid multiple instances running: 
	if ((window as any).hasRun === true)
		return true;
	(window as any).hasRun = true;

	const CONTAINER: Element = document.documentElement || document.body

	// Api key is passed from extension via message
	let API_KEY: string = localStorage.getItem("sadCaptchaKey");
	chrome.runtime.onMessage.addListener(
		function(request: Request, sender, sendResponse) {
			if (request.apiKey !== null) {
				console.log("Api key: " + request.apiKey)
				API_KEY = request.apiKey
				localStorage.setItem("sadCaptchaKey", API_KEY)
				sendResponse({ message: "API key set.", success: 1 })
			} else {
				sendResponse({ message: "API key cannot be empty.", success: 0 })
			} 
		}
	)

	let creditsUrl = "https://www.sadcaptcha.com/api/v1/license/credits?licenseKey="
	let arcedSlideUrl = "https://www.sadcaptcha.com/api/v1/temu-arced-slide?licenseKey="
	let threeByThreeUrl = "https://www.sadcaptcha.com/api/v1/temu-three-by-three?licenseKey="
	let puzzleUrl = "https://www.sadcaptcha.com/api/v1/puzzle?licenseKey="
	let semanticShapesUrl = "https://www.sadcaptcha.com/api/v1/semantic-shapes?licenseKey="

	const API_HEADERS = new Headers({ "Content-Type": "application/json" })

	const ARCED_SLIDE_PUZZLE_IMAGE_SELECTOR = "#slider > img"
	const ARCED_SLIDE_PIECE_CONTAINER_SELECTOR = "#img-button"
	const ARCED_SLIDE_PIECE_IMAGE_SELECTOR = "#img-button > img"
	const ARCED_SLIDE_BUTTON_SELECTOR = "#slide-button"
	const ARCED_SLIDE_UNIQUE_IDENTIFIERS = [".handleBar-vT4I5", ".vT4I57cQ", "div[style=\"width: 414px;\"] #slider", "div[style=\"width: 410px;\"] #slider"]

	const PUZZLE_BUTTON_SELECTOR = "#slide-button"
	const PUZZLE_PUZZLE_IMAGE_SELECTOR = "#slider > img"
	const PUZZLE_PIECE_IMAGE_SELECTOR = "#img-button > img"
	const PUZZLE_SLIDER_WRAPPER = "[class^=slider-wrapper]"
	const PUZZLE_UNIQUE_IDENTIFIERS = ["#Slider"]

	const SEMANTIC_SHAPES_CHALLENGE_TEXT = ".picture-text-2Alt0, div._2Alt0zsN"
	const SEMANTIC_SHAPES_IMAGE = "#captchaImg"
	const SEMANTIC_SHAPES_REFRESH_BUTTON = ".refresh-27d6x, .ZVIQM964"
	const SEMANTIC_SHAPES_UNIQUE_IDENTIFIERS = [SEMANTIC_SHAPES_IMAGE, "#captchaImg"]

	const THREE_BY_THREE_IMAGE = "img.loaded"
	const THREE_BY_THREE_TEXT = ".verifyDialog div[role=dialog]"
	const THREE_BY_THREE_CONFIRM_BUTTON = ".verifyDialog div[role=button]:has(span)"
	const THREE_BY_THREE_UNIQUE_IDENTIFIERS = ["#imageSemantics img.loaded"]

	const CAPTCHA_PRESENCE_INDICATORS = [
		"#slide-button",
		"#Slider",
		"#slider",
		"iframe",
		"#imageSemantics img.loaded",
		SEMANTIC_SHAPES_IMAGE,
		".iframe-3eaNR",
		".iframe-8Vtge",
		"#captchaImg"
	]

	type Point = {
		x: number
		y: number
	}

	type ProportionalPoint = {
		proportionX: number
		proportionY: number
	}

	type SemanticShapesResponse = {
		proportionalPoints: Array<ProportionalPoint>
	}

	/*
		* A point along the trajectory of the arced slide captcha.
		* Contains data about the position and rotation of the sliding piece
	*/
	type TrajectoryElement = {
		pixels_from_slider_origin: number
		piece_rotation_angle: number
		piece_center: ProportionalPoint
	}

	/*
		* This object contains data about the arced slide captcha including 
		* images, the trajectory of the slider, and the position of the 
		* slider button.
	*/
	type ArcedSlideCaptchaRequest = {
		puzzle_image_b64: string
		piece_image_b64: string
		slide_piece_trajectory: Array<TrajectoryElement>
	}

	type ArcedSlideCaptchaResponse = {
		pixels_from_slider_origin: number
	}

	/*
    * Contains data bout the 3x3 captcha.
    * This includes the names of the objects as a list
    * in the order they are meant to be selected. It
    * also includes the images as a list of base64 strings
    * where  indexes 0-2 are the top row, 3-5 are the
    * middle, and 6-8 are the bottom row.
	*/
	type ThreeByThreeCaptchaRequest = {
		objects_of_interest: Array<string>
		images: Array<string>
	}

	/*
    * The indices of correct inages to click, in the order they must be clicked.
    * Where the indeces correspond to the following panels:
    *     0 1 2
    *     3 4 5
    *     6 7 8
	*/
	type ThreeByThreeCaptchaResponse = {
		solution_indices: Array<number>
	}

	enum CaptchaType {
		PUZZLE,
		ARCED_SLIDE,
		SEMANTIC_SHAPES,
		THREE_BY_THREE
	}

	function findFirstElementToAppear(selectors: Array<string>): Promise<Element> {
		return new Promise(resolve => {
			const observer: MutationObserver = new MutationObserver(mutations => {
			for (const mutation of mutations) {
				if (mutation.addedNodes === null) 
					continue
				let addedNode: Array<Node> = []
				mutation.addedNodes.forEach(node => addedNode.push(node))
				for (const node of addedNode)
					for (const selector of selectors) {
						if (node instanceof HTMLIFrameElement) {
							let iframe = <HTMLIFrameElement>node 
							setTimeout(() => {
								let iframeElement = iframe.contentWindow.document.body.querySelector(selector)
								if (iframeElement) {
									console.debug(`element matched ${selector} in iframe`)
									observer.disconnect()
									console.dir(iframeElement)
									return  resolve(iframeElement)
								} 
							}, 3000)
						} else if (node instanceof Element) {
							let element = <Element>node
							if (element.querySelector(selector)) {
								console.debug(`element matched ${selector}`)
								observer.disconnect()
								console.dir(element)
								return resolve(element)
							}
						}
					}
				}
			})
			observer.observe(CONTAINER, {
				childList: true,
				subtree: true
			})
		})
	}

	function waitForElement(selector: string): Promise<Element> {
		return new Promise(resolve => {
			console.log("checking for " + selector)
			if (document.querySelector(selector)) {
				console.log("Selector found: " + selector)
				return resolve(document.querySelector(selector)!) 
			} else if (document.querySelector("iframe")){
				console.log("checking in iframe...")
				let iframe = document.querySelector("iframe")
				let ele = iframe.contentWindow.document.querySelector(selector)
				if (ele) {
					console.log("Selector found: " + selector)
					return resolve(ele)
				}
			} else {
				const observer: MutationObserver = new MutationObserver(_ => {
					if (document.querySelector(selector)) {
						observer.disconnect()
						console.log("Selector found by mutation observer: " + selector)
						return resolve(document.querySelector(selector)!)
					}
					let iframe = document.querySelector("iframe")
					let ele = iframe.contentWindow.document.querySelector(selector)
					if (ele) {
						observer.disconnect()
						console.log("Selector found by mutation observer: " + selector)
						return resolve(ele)
					}
				})
				console.log("created mutation observer")
				observer.observe(CONTAINER, {
					childList: true,
					subtree: true
				})
			}
		})
	}

	function waitForAllElements(selector: string): Promise<NodeListOf<Element>> {
		return new Promise(resolve => {
			console.log("checking for " + selector)
			if (document.querySelector(selector)) {
				console.log("Selector found: " + selector)
				return resolve(document.querySelectorAll(selector)!) 
			} else if (document.querySelector("iframe")){
				console.log("checking in iframe...")
				let iframe = document.querySelector("iframe")
				let ele = iframe.contentWindow.document.querySelectorAll(selector)
				if (ele) {
					console.log("Selector found: " + selector)
					return resolve(ele)
				}
			} else {
				const observer: MutationObserver = new MutationObserver(_ => {
					if (document.querySelector(selector)) {
						observer.disconnect()
						console.log("Selector found by mutation observer: " + selector)
						return resolve(document.querySelectorAll(selector)!)
					}
					let iframe = document.querySelector("iframe")
					let ele = iframe.contentWindow.document.querySelectorAll(selector)
					if (ele) {
						observer.disconnect()
						console.log("Selector found by mutation observer: " + selector)
						return resolve(ele)
					}
				})
				console.log("created mutation observer")
				observer.observe(CONTAINER, {
					childList: true,
					subtree: true
				})
			}
		})
	}

	async function getTextContent(selector: string): Promise<string> {
		let ele = await waitForElement(selector)
		let text = ele.textContent
		console.log(`text of ${selector}: ${text}`)
		return text
	}

	async function creditsApiCall(): Promise<number> {
		console.log("making api call")
		let resp = await fetch(creditsUrl + API_KEY, {
			method: "GET",
			headers: API_HEADERS,
		})
		let credits = (await resp.json()).credits
		console.log("api credits = " + credits)
		return credits
	}

	async function apiCall(url: string, body: any): Promise<any> {
		console.log("making api call")
		let resp = await fetch(url + API_KEY, {
			method: "POST",
			headers: API_HEADERS,
			body: JSON.stringify(body)
		})
		console.log("got api response:")
		console.log(resp)
		return resp
	}

	async function threeByThreeApiCall(requestBody: ThreeByThreeCaptchaRequest): Promise<ThreeByThreeCaptchaResponse> {
		let resp = await apiCall(threeByThreeUrl, requestBody)
		console.dir("got resp to 3x3 api call: ")
		console.dir(resp)
		return resp.json()
	}

	async function arcedSlideApiCall(requestBody: ArcedSlideCaptchaRequest): Promise<number> {
		let resp = await apiCall(arcedSlideUrl, requestBody)
		let pixelsFromSliderOrigin = (await resp.json()).pixelsFromSliderOrigin
		console.log("pixels from slider origin = " + pixelsFromSliderOrigin)
		return pixelsFromSliderOrigin
	}

	async function puzzleApiCall(puzzleB64: string, pieceB64: string): Promise<number> {
		let resp = await apiCall(puzzleUrl, {
			puzzleImageB64: puzzleB64,
			pieceImageB64: pieceB64
		})
		let slideXProportion = (await resp.json()).slideXProportion
		console.log("slideXProportion = " + slideXProportion)
		return slideXProportion
	}

	async function semanticShapesApiCall(challenge: string, imageB64: string): Promise<SemanticShapesResponse> {
		let resp = await apiCall(semanticShapesUrl, {
			challenge: challenge,
			imageB64: imageB64
		})
		let data = await resp.json()
		return data
	}

	function anySelectorInListPresent(selectors: Array<string>): boolean {
		for (const selector of selectors) {
			let ele = document.querySelector(selector)
			if (ele) {
				console.log(`selector ${selector} is present`)
				return true
			}
			let iframe = document.querySelector("iframe")
			if (iframe) {
				console.log("checking for selector in iframe")
				ele = iframe.contentWindow.document.body.querySelector(selector)
				if (ele) {
					console.log("Selector is present in iframe: " + selector)
					return true
				}
			}
		}
		console.log(`no selector in list is present`)
		return false
	}

	async function identifyCaptcha(): Promise<CaptchaType> {
		for (let i = 0; i < 30; i++) {
			if (anySelectorInListPresent(ARCED_SLIDE_UNIQUE_IDENTIFIERS)) {
				console.log("arced slide detected")
				return CaptchaType.ARCED_SLIDE
			} else if (anySelectorInListPresent(PUZZLE_UNIQUE_IDENTIFIERS)) {
				console.log("puzzle detected")
				return CaptchaType.PUZZLE
			} else if (anySelectorInListPresent(SEMANTIC_SHAPES_UNIQUE_IDENTIFIERS)) {
				console.log("semantic shapes detected")
				return CaptchaType.SEMANTIC_SHAPES
			} else if (anySelectorInListPresent(THREE_BY_THREE_UNIQUE_IDENTIFIERS)) {
				console.log("3x3 detected")
				return CaptchaType.THREE_BY_THREE
			} else {
				await new Promise(r => setTimeout(r, 1000));
			}
		}
		throw new Error("Could not identify CaptchaType")
	}

	async function getImageSource(selector: string): Promise<string> {
		let ele = await waitForElement(selector)
		let src = ele.getAttribute("src")
		console.log("src = " + selector)
		return src
	}

	function getBase64StringFromDataURL(dataUrl: string): string {
		let img = dataUrl.replace('data:', '').replace(/^.+,/, '')
		console.log("got b64 string from data URL")
		return img
	}

	function mouseUp(x: number, y: number): void {
		CONTAINER.dispatchEvent(
			new MouseEvent("mouseup", {
				bubbles: true,
				view: window,
				clientX: x,
				clientY: y
			})
		)
		console.log("mouse up at " + x + ", " + y)
	}

	function mouseOver(x, y): void {
		let underMouse = document.elementFromPoint(x, y)
		underMouse.dispatchEvent(
			new MouseEvent("mouseover", {
				cancelable: true,
				bubbles: true,
				view: window,
				clientX: x,
				clientY: y
			})
		)
		console.log("mouse over at " + x + ", " + y)
	}

	function mouseDown(x: number, y: number): void {
		let underMouse = document.elementFromPoint(x, y)
		underMouse.dispatchEvent(
			new MouseEvent("mousedown", {
				cancelable: true,
				bubbles: true,
				view: window,
				clientX: x,
				clientY: y
			})
		)
		console.log("mouse down at " + x + ", " + y)
	} 

	function mouseEnterPage(): void {
		let width = window.innerWidth
		let centerX = window.innerWidth / 2
		let centerY = window.innerHeight / 2
		CONTAINER.dispatchEvent(
			new PointerEvent("pointerover", {
				pointerType: "mouse",
				cancelable: true,
				bubbles: true,
				view: window,
				clientX: width,
				clientY: centerY
			})
		)
		CONTAINER.dispatchEvent(
			new MouseEvent("mouseover", {
				cancelable: true,
				bubbles: true,
				view: window,
				clientX: width,
				clientY: centerY
			})
		)
		for (let i = 0; i < centerX; i++) {
			mouseMove(width - i, centerY)
		}
	}

	function mouseMove(x: number, y: number, ele?: Element): void {
		let c: Element
		if (ele === undefined) {
			c = CONTAINER
		} else {
			c = ele
		}
		c.dispatchEvent(
			new PointerEvent("mousemove", {
				pointerType: "mouse",
				cancelable: true,
				bubbles: true,
				view: window,
				clientX: x,
				clientY: y
			})
		)
		console.log("moved mouse to " + x + ", " + y)
	}

	function mouseClick(element: Element, x: number, y: number): void {
		element.dispatchEvent(
			new MouseEvent("mouseover", {
				bubbles: true,
				clientX: x,
				clientY: y
			})
		)
		setTimeout(() => null, 10)
		element.dispatchEvent(
			new MouseEvent("mousedown", {
				bubbles: true,
				clientX: x,
				clientY: y
			})
		)
		setTimeout(() => null, 200)
		element.dispatchEvent(
			new MouseEvent("mouseup", {
				bubbles: true,
				clientX: x,
				clientY: y
			})
		)
	}

	function getElementCenter(element: Element): Point {
		let rect = element.getBoundingClientRect()
		let center = {
			x: rect.x + (rect.width / 2),
			y: rect.y + (rect.height / 2),
		}
		console.log("element center: ")
		console.dir(center)
		return center
	}

	function getElementWidth(element: Element): number {
		let rect = element.getBoundingClientRect()
		console.log("element width: " + rect.width)
		return rect.width
	}

	function clickCenterOfElement(element: Element): void {
		let rect = element.getBoundingClientRect()
		let x = rect.x + (rect.width / 2)
		let y = rect.y + (rect.height / 2)
		mouseClick(element, x, y)
	}

	function clickProportional(element: Element, proportionX: number, proportionY: number): void {
		let boundingBox = element.getBoundingClientRect()
		let xOrigin = boundingBox.x
		let yOrigin = boundingBox.y
		let xOffset = (proportionX * boundingBox.width)
		let yOffset = (proportionY * boundingBox.height)
		let x = xOrigin + xOffset
		let y = yOrigin + yOffset
		console.log(`clicked at ${x}, ${y}`)
		mouseClick(element, x, y)
	}

	function computePuzzleSlideDistance(proportionX: number, puzzleImageEle: Element): number {
		let distance = puzzleImageEle.getBoundingClientRect().width * proportionX
		console.log("puzzle slide distance = " + distance)
		return distance
	}

	async function solveArcedSlide(): Promise<void> {
		let puzzleImageSrc = await getImageSource(ARCED_SLIDE_PUZZLE_IMAGE_SELECTOR)
		let pieceImageSrc = await getImageSource(ARCED_SLIDE_PIECE_IMAGE_SELECTOR)
		let puzzleImg = getBase64StringFromDataURL(puzzleImageSrc)
		let pieceImg = getBase64StringFromDataURL(pieceImageSrc)
		let slideButtonEle = await waitForElement(ARCED_SLIDE_BUTTON_SELECTOR)
		const startX = getElementCenter(slideButtonEle).x
		const startY = getElementCenter(slideButtonEle).y
		let puzzleEle = await waitForElement(ARCED_SLIDE_PUZZLE_IMAGE_SELECTOR)
		let trajectory = await getSlidePieceTrajectory(slideButtonEle, puzzleEle)
		let solution = await arcedSlideApiCall({
			piece_image_b64: pieceImg,
			puzzle_image_b64: puzzleImg,
			slide_piece_trajectory: trajectory
		})
		let currentX = getElementCenter(slideButtonEle).x
		let solutionDistanceBackwards = currentX - startX - solution
		let overshoot = 6
		let mouseStep = 2
		await new Promise(r => setTimeout(r, 100));
		for (
				let i = 0;
				i < solutionDistanceBackwards;
				i += 1
		) {
			mouseMove(
				currentX - i,
				startY + Math.random() * 5
			)
			console.debug("current x: " + currentX)
			await new Promise(r => setTimeout(r, 10 + Math.random() * 5));
		}
		await new Promise(r => setTimeout(r, 300));
		mouseMove(startX + solution, startY)
		mouseUp(startX + solution, startY)
		await new Promise(r => setTimeout(r, 3000));
	}

	async function getSlidePieceTrajectory(slideButton: Element, puzzle: Element): Promise<Array<TrajectoryElement>> {
		let sliderPieceContainer = await waitForElement(ARCED_SLIDE_PIECE_CONTAINER_SELECTOR)
		console.log("got slider piece container")
		let slideBarWidth = getElementWidth(puzzle)
		console.log("slide bar width: " + slideBarWidth)
		let timesPieceDidNotMove = 0
		let slideButtonCenter = getElementCenter(slideButton)
		let puzzleImageBoundingBox = puzzle.getBoundingClientRect()
		let trajectory: Array<TrajectoryElement> = []
		let mouseStep = 5
		mouseEnterPage()
		mouseMove(slideButtonCenter.x, slideButtonCenter.y)
		mouseDown(slideButtonCenter.x, slideButtonCenter.y)
		slideButton.dispatchEvent(
			new MouseEvent("mousedown", {
				cancelable: true,
				bubbles: true,
				view: window,
				clientX: slideButtonCenter.x, 
				clientY: slideButtonCenter.y
			})
		)
		for (let pixel = 0; pixel < slideBarWidth; pixel += mouseStep) {
			await new Promise(r => setTimeout(r, 10 + Math.random() * 5));
			//moveMouseTo(slideButtonCenter.x + pixel, slideButtonCenter.y - pixel)
			slideButton.dispatchEvent(
				new MouseEvent("mousemove", {
					cancelable: true,
					bubbles: true,
					view: window,
					clientX: slideButtonCenter.x + pixel, 
					clientY: slideButtonCenter.y - Math.log(pixel + 1)
				})
			)
			await new Promise(r => setTimeout(r, 40));
			let trajectoryElement = getTrajectoryElement(
				pixel,
				puzzleImageBoundingBox,
				sliderPieceContainer
			)
			trajectory.push(trajectoryElement)
			if (trajectory.length < 100 / mouseStep)
				continue
			if (pieceIsNotMoving(trajectory))
				timesPieceDidNotMove++
			else
				timesPieceDidNotMove = 0
			if (timesPieceDidNotMove >= 10 / mouseStep)
				break
			console.log("trajectory element:")
			console.dir(trajectoryElement)
		}
		return trajectory
	}

	function getTrajectoryElement(
		currentSliderPixel: number,
		largeImgBoundingBox: DOMRect,
		sliderPiece: Element
	): TrajectoryElement {
		let sliderPieceStyle = sliderPiece.getAttribute("style")
		let rotateAngle = rotateAngleFromStyle(sliderPieceStyle)
		let pieceCenter = getElementCenter(sliderPiece)
		let pieceCenterProp = xyToProportionalPoint(largeImgBoundingBox, pieceCenter) // This returns undefined
		let ele = {
			piece_center: pieceCenterProp,
			piece_rotation_angle: rotateAngle,
			pixels_from_slider_origin: currentSliderPixel
		}
		console.dir(ele)
		return ele
	}

	function rotateAngleFromStyle(style: string): number {
		let rotateRegex = /.*rotate\(|deg.*/gi
		let rotateAngle: number
		if (style.search(rotateRegex) === -1) {
			rotateAngle = 0
		} else {
			let rotateStr = style.replace(rotateRegex, "")
			rotateAngle = parseFloat(rotateStr)
		}
		console.log("rotate angle: " + rotateAngle)
		return rotateAngle
	}

	function pieceIsNotMoving(trajetory: Array<TrajectoryElement>): Boolean {
		console.dir(trajetory)
		if (trajetory[trajetory.length - 1].piece_center.proportionX == 
		    trajetory[trajetory.length - 2].piece_center.proportionX) {
			console.log("piece is not moving")
			return true
		} else {
			console.log("piece is moving")
			return false
		}

	}

	function xyToProportionalPoint(container: DOMRect, point: Point): ProportionalPoint {
		let xInContainer = point.x - container.x
		let yInContainer = point.y - container.y
		return {
			proportionX: xInContainer / container.width,
			proportionY: yInContainer / container.height,
		}
	}

	async function solvePuzzle(): Promise<void> {
		await new Promise(r => setTimeout(r, 3000));
		let sliderWrapper = await waitForElement(PUZZLE_SLIDER_WRAPPER)
		let sliderButton = await waitForElement(PUZZLE_BUTTON_SELECTOR)
		let wrapperCenter = getElementCenter(sliderWrapper)
		let buttonCenter = getElementCenter(sliderButton)
		let preRequestSlidePixels = 10
		mouseEnterPage()
		mouseMove(wrapperCenter.x, wrapperCenter.y)
		mouseOver(wrapperCenter.x, wrapperCenter.y)
		await new Promise(r => setTimeout(r, 133.7));
		mouseMove(buttonCenter.x, buttonCenter.y)
		mouseOver(buttonCenter.x, buttonCenter.y)
		await new Promise(r => setTimeout(r, 133.7));
		mouseDown(buttonCenter.x, buttonCenter.y)
		await new Promise(r => setTimeout(r, 133.7));
		for (let i = 1; i < preRequestSlidePixels; i++) {
			mouseMove(
				buttonCenter.x + i, 
				buttonCenter.y - Math.log(i) + Math.random() * 3
			)
			await new Promise(r => setTimeout(r, Math.random() * 5 + 10));
		}
		let puzzleSrc = await getImageSource(PUZZLE_PUZZLE_IMAGE_SELECTOR)
		let pieceSrc = await getImageSource(PUZZLE_PIECE_IMAGE_SELECTOR)
		console.log("got image sources")
		let puzzleImg = getBase64StringFromDataURL(puzzleSrc)
		let pieceImg = getBase64StringFromDataURL(pieceSrc)
		console.log("converted image sources to b64 string")
		let solution = await puzzleApiCall(puzzleImg, pieceImg)
		console.log("got API result: " + solution)
		let puzzleImageEle = await waitForElement(PUZZLE_PUZZLE_IMAGE_SELECTOR)
		let distance = computePuzzleSlideDistance(solution, puzzleImageEle)
		let currentX: number
		let currentY: number
		for (let i = 1; i < distance - preRequestSlidePixels; i += Math.random() * 5) {
			currentX = buttonCenter.x + i + preRequestSlidePixels
			currentY = buttonCenter.y - Math.log(i) + Math.random() * 3
			mouseMove(currentX, currentY)
			mouseOver(currentX, currentY)
			await new Promise(r => setTimeout(r, Math.random() * 5 + 10));
		}
		await new Promise(r => setTimeout(r, 133.7));
		mouseOver(buttonCenter.x + distance, buttonCenter.x - distance)
		await new Promise(r => setTimeout(r, 133.7));
		mouseUp(buttonCenter.x + distance, buttonCenter.x - distance)
		await new Promise(r => setTimeout(r, 3000));
	}

	async function solveSemanticShapes(): Promise<void> {
		let src = await getImageSource(SEMANTIC_SHAPES_IMAGE)
		let img = getBase64StringFromDataURL(src)
		let challenge = await getTextContent(SEMANTIC_SHAPES_CHALLENGE_TEXT)
		let res: SemanticShapesResponse
		try {
			res = await semanticShapesApiCall(challenge, img)
		} catch (err) {
			console.log("Error calling semantic shapes API. refreshing and retrying")
			console.error(err)
			await refreshSemanticShapes()
			await solveSemanticShapes()
		}
		let ele = await waitForElement(SEMANTIC_SHAPES_IMAGE)
		for (const point of res.proportionalPoints) {
			clickProportional(ele, point.proportionX, point.proportionY)
			await new Promise(r => setTimeout(r, 1337));
		}
		await new Promise(r => setTimeout(r, 3000));
		let newChallenge = await getTextContent(SEMANTIC_SHAPES_CHALLENGE_TEXT)
		let challengeDidNotChange = (challenge === newChallenge)
		if (challengeDidNotChange) {
			console.log(
				"It seems that the shapes challenge did not change after clicking the image."
				+ "This is probably because the solution lies under tha black loading box, "
				+ "which means it's impossible to click (thanks temu). Refreshing and retrying."
			)
			await refreshSemanticShapes()
			await solveSemanticShapes()
		}
		await new Promise(r => setTimeout(r, 3000));
	}

	async function solveThreeByThree() {
		let imageElements = await waitForAllElements(THREE_BY_THREE_IMAGE)
		let imageB64 = []
		imageElements.forEach(ele => {
			imageB64.push(getBase64StringFromDataURL(ele.getAttribute("src")))
		})
		let challengeText = await getTextContent(THREE_BY_THREE_TEXT)
		let objects = parseThreeByThreeObjectsOfInterest(challengeText)
		let request: ThreeByThreeCaptchaRequest = {
			objects_of_interest: objects,
			images: imageB64
		}
		let resp = await threeByThreeApiCall(request)
		for (let i in resp.solution_indices) {
			let ele = await waitForElement(`img[src*="${imageB64[i]}"]`)	
			clickProportional(ele, 0.69, 0.69)
			setTimeout(() => null, 1337)
		}
		clickProportional(await waitForElement(THREE_BY_THREE_CONFIRM_BUTTON), 0.69, 0.420)
	}

	/*
    * Get the list of objects to select from Temu 3x3 captcha
    * ex:
    *     input: 'Click on the corresponding images in the following order: 'television','strawberry','peach'
    *     output: ['television', 'strawberry', 'peach']
	*/
	function parseThreeByThreeObjectsOfInterest(challengeText: string): Array<string> {
		let objects = challengeText.match(/(?<=')[\w\s]+?(?=')/g)
		console.log(`input text: ${challengeText}\nobjects of interest: ${objects}`) 
		return objects
	}

	async function refreshSemanticShapes() {
			let refreshButton = await waitForElement(SEMANTIC_SHAPES_REFRESH_BUTTON)
			clickCenterOfElement(refreshButton)
			setTimeout(() => null, 3000)

	}

	function captchaIsPresent(): boolean {
		for (let i = 0; i < CAPTCHA_PRESENCE_INDICATORS.length; i++) {
			if (document.querySelector(CAPTCHA_PRESENCE_INDICATORS[i])) {
				console.log("captcha present based on selector: " + CAPTCHA_PRESENCE_INDICATORS[i])
				return true;
			}
		}
		console.log("captcha not present")
		return false
	}


	let isCurrentSolve: boolean = false
	async function solveCaptchaLoop() {
		if (!isCurrentSolve) {
			if (captchaIsPresent()){
				console.log("captcha detected by css selector")
			} else {
				console.log("waiting for captcha")
				const _: Element = await findFirstElementToAppear(CAPTCHA_PRESENCE_INDICATORS)
				console.log("captcha detected by mutation observer")
			}

			isCurrentSolve = true
			let captchaType: CaptchaType
			try {
				captchaType = await identifyCaptcha()
			} catch (err) {
				console.log("could not detect captcha type. restarting captcha loop")
				isCurrentSolve = false
				await solveCaptchaLoop()
			}

			try {
				if (await creditsApiCall() <= 0) {
					console.log("out of credits")
					alert("Out of SadCaptcha credits. Please boost your balance on sadcaptcha.com/dashboard.")
					return
				}
			} catch (e) {
				console.log("error making check credits api call")
				console.error(e)
				console.log("proceeding to attempt solution anyways")
			}
		
			try {
				switch (captchaType) {
					case CaptchaType.PUZZLE:
						await solvePuzzle()
						break
					case CaptchaType.ARCED_SLIDE:
						await solveArcedSlide()
						break
					case CaptchaType.SEMANTIC_SHAPES:
						await solveSemanticShapes()
						break
					case CaptchaType.THREE_BY_THREE:
						await solveThreeByThree()
						break
				}
			} catch (err) {
				console.log("error solving captcha")
				console.error(err)
				console.log("restarting captcha loop")
			} finally {
				isCurrentSolve = false
				await new Promise(r => setTimeout(r, 5000));
				await solveCaptchaLoop()
			}
		}
	}

	solveCaptchaLoop()

})();
