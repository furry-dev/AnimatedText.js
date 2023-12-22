/**
 * Тип, представляющий тип анимации.
 */
type AnimationType = "symbol";

/**
 * Интерфейс для элементов анимации "symbol".
 */
interface SymbolAnimationItem {
    from: string;
    to: string;
    start: number;
    end: number;
    char?: string;
}

/**
 * Интерфейс, представляющий аниматор с общими методами.
 */
interface Animator {
    /**
     * Устанавливает новый текст элемента.
     * @param text {string} - Текст для установки.
     * @returns {Promise<void>} Промис завершения анимации.
     */
    setText(text: string): Promise<void>,

    /**
     * Устанавливает фразы для циклической анимации.
     * @param list {string[]} - Список фраз.
     * @param delay {number} - Задержка для анимации. В случае анимации "symbol", задержка на 1 символ в строке(задержка = delay * string.length)
     */
    setPhrases(list: string[], delay: number): void
}

/**
 * Класс, реализующий анимацию текстового перехода через случайные символы.
 */
class SymbolAnimator implements Animator {
    private el: HTMLElement
    private frame: number = 0
    private resolve: CallableFunction
    private queue: SymbolAnimationItem[] = []
    private frameRequest: number

    private chars: string = "!<>-_\\/[]{}░▒▓—åß∂ƒ©˙∆˚æ≈ç√∫=+*^?#λ@$%&()~`|:,."

    /**
     * Создает экземпляр SymbolAnimator.
     * @param element {HTMLElement} - HTML-элемент для анимации.
     */
    constructor(element: HTMLElement) {
        this.el = element
        this.update = this.update.bind(this)
    }

    setText(text: string): Promise<void> {
        return new Promise((resolve: CallableFunction) => {
            this.resolve = resolve

            const currentText = this.el.innerText
            const maxLength = Math.max(currentText.length, text.length)

            this.queue = []

            for (let i = 0; i < maxLength; i++) {
                const fromChar = currentText[i] || ""
                const toChar = text[i] || ""
                const startFrame = Math.floor(40 * Math.random())
                const endFrame = startFrame + Math.floor(40 * Math.random())

                this.queue.push({ from: fromChar, to: toChar, start: startFrame, end: endFrame })
            }

            cancelAnimationFrame(this.frameRequest)
            this.frame = 0
            this.update()
        })
    }

    setPhrases(list: string[], symbolDel: number = 200) {
        let index = 0

        const changeText = () => {
            const currentPhrase = list[index]
            const charCount = currentPhrase.replace(/<[^>]*>/g, "").length
            const delay = charCount * symbolDel

            this.setText(currentPhrase).then(() => {
                setTimeout(changeText, delay)
            })
            index = (index + 1) % list.length
        }

        changeText()
    }

    /**
     * Обновляет кадр анимации.
     */
    update(): void {
        let output = ""
        let count = 0

        for (let i = 0, len = this.queue.length; i < len; i++) {
            const item = this.queue[i]
            const fromChar = item.from
            const toChar = item.to
            const startFrame = item.start
            const endFrame = item.end
            let currentChar = item.char

            const useRandomChar = !currentChar || Math.random() < 0.28

            if (this.frame >= endFrame) {
                count++
                output += toChar
            } else if (this.frame >= startFrame) {
                if (useRandomChar) {
                    currentChar = this.randomChar()
                    this.queue[i].char = currentChar
                }
                output += `<span class="dud">${currentChar}</span>`
            } else {
                output += fromChar
            }
        }

        this.el.innerHTML = output

        if (count === this.queue.length) {
            this.resolve()
        } else {
            this.frameRequest = requestAnimationFrame(this.update)
            this.frame++
        }
    }

    /**
     * Возвращает случайный символ из доступных символов.
     * @returns {string} Случайно выбранный символ.
     */
    randomChar(): string {
        const allChars = this.chars
        return allChars[Math.floor(Math.random() * allChars.length)]
    }
}

/**
 * Класс, представляющий текстовый аниматор.
 */
class TextAnimator implements Animator {
    /**
     * Экземпляр аниматора.
     */
    readonly animator: Animator

    /**
     * Создает экземпляр TextAnimator.
     * @param element {HTMLElement} - HTML-элемент для анимации.
     * @param animation {AnimationType} - Тип анимации.
     */
    constructor(element: HTMLElement, animation: AnimationType = "symbol") {
        this.animator = this.createAnimator(element, animation)
    }

    /**
     * Создает соответствующий аниматор в зависимости от типа анимации.
     * @param element {HTMLElement} - HTML-элемент для анимации.
     * @param animation {AnimationType} - Тип анимации.
     * @returns {Animator} Созданный экземпляр аниматора.
     */
    private createAnimator(element: HTMLElement, animation: AnimationType): Animator {
        switch (animation) {
            case "symbol":
                return new SymbolAnimator(element)
            default:
                throw new Error("Unsupported animation type")
        }
    }

    setText(text: string): Promise<void> {
        return this.animator.setText(text)
    }

    setPhrases(list: string[], delay: number = 200): void {
        return this.animator.setPhrases(list, delay)
    }
}
