# درخت گروه‌ها و تنظیمات حالت ویژوال

این سند ساختار گروه‌های موجود در منوی حالت ویژوال و زیرگروه‌ها و تنظیمات اصلی پیشنهادی برای هر گروه را مشخص می‌کند. نام گروه‌ها و شناسه‌های `data-visual-group` با دکمه‌های تعریف‌شده در `index.html` هماهنگ هستند. درخت زیر موضوعی است؛ ترتیب نمایش منو از پرکاربرد به کم‌کاربرد چنین است:

`Color & Background` → `Spacing` → `Typography` → `Custom Settings` → `Display & Flow` → `Sizing` → `Border & Outline` → `Flexbox` → `Grid` → `Positioning` → `Text & Writing` → `Shadow` → `Effects & Filters` → `Transform` → `Responsive` → `Interaction & Cursor` → `Visibility` → `Overflow & Scrolling` → `Form Controls` → `Columns` → `Containment & Container Queries` → `Custom Properties` → `Transitions & Animation` → `Scroll Snap & Behavior` → `Lists & Markers` → `Tables` → `States & Pseudo-classes` → `Generated Content` → `SVG` → `Logical Properties` → `Masking & Clipping` → `Accessibility & Motion` → `View Transitions`.

> **وضعیت فعلی:** ۳۳ گروه در رابط کاربری ثبت شده‌اند. ترتیب منو بر پایهٔ کاربرد رایج است. هر گروه کنترل‌های ویژگی‌های متداول CSS را دارد؛ گزینه‌های انتخابی و پیشنهادهای فهرست‌شده برای فیلدهای متنی ارائه می‌شوند و مقدارهای دلخواه CSS نیز قابل ورود هستند. فیلدها مقدار آغازین معتبر دارند؛ برای ورود عدد در ویژگی‌های طولی و زمانی، به‌ترتیب `px` یا `ms` به‌طور خودکار افزوده می‌شود. تغییرها در پیش‌نمایش اعمال و در بلاک مدیریت‌شدهٔ CSS پروژه ذخیره می‌شوند.

```text
حالت ویژوال
├── انتخاب المان
│   ├── نمایش تگ، شناسه و کلاس المان انتخاب‌شده
│   ├── انتخاب المان با کلیک روی پیش‌نمایش
│   └── بازگشت به فهرست گروه‌ها
├── Display & Flow [layout]
│   ├── نمایش: display، box-sizing
│   ├── جریان محتوا: flow-root، ترتیب چیدمان
│   └── تراز عمومی: vertical-align، place-content
├── Positioning [positioning]
│   ├── شیوهٔ موقعیت‌دهی: position، z-index
│   ├── مختصات: inset، top، right، bottom، left
│   └── مرجع موقعیت: containing block
├── Flexbox [flexbox]
│   ├── محور و جهت: flex-direction، flex-wrap
│   ├── توزیع و تراز: justify-content، align-items، align-content
│   └── اندازهٔ فرزند: flex، flex-grow، flex-shrink، flex-basis، order
├── Grid [grid]
│   ├── ساختار شبکه: grid-template-columns، grid-template-rows
│   ├── فاصله و ناحیه‌ها: gap، grid-template-areas
│   └── جایگاه فرزند: grid-column، grid-row، justify-self، align-self
├── Columns [columns]
│   ├── تعداد و عرض ستون: column-count، column-width
│   ├── فاصله و جداکننده: column-gap، column-rule
│   └── شکست ستون: break-before، break-after، column-span
├── Sizing [sizing]
│   ├── اندازهٔ اصلی: width، height
│   ├── حداقل و حداکثر: min-width، max-width، min-height، max-height
│   └── نسبت و محدودیت: aspect-ratio، box-sizing
├── Spacing [spacing]
│   ├── فاصلهٔ بیرونی: margin، margin-block، margin-inline
│   ├── فاصلهٔ درونی: padding، padding-block، padding-inline
│   └── فاصلهٔ بین فرزندان: gap، row-gap، column-gap
├── Typography [typography]
│   ├── قلم: font-family، font-size، font-weight، font-style
│   ├── فاصله‌گذاری: line-height، letter-spacing، word-spacing
│   └── قلم‌های متغیر و تزئین: font-variation-settings، font-feature-settings
├── Custom Settings [custom-settings]
│   └── ویرایش سریع: display، width، height، color، background-color، padding، margin، border-radius، box-shadow، transform
├── Text & Writing [text]
│   ├── تراز و جهت: text-align، text-align-last، direction
│   ├── شکست و سرریز: white-space، overflow-wrap، word-break
│   └── تزئین و سایه: text-decoration، text-transform، text-shadow
├── Color & Background [color-background]
│   ├── رنگ متن و شفافیت: color، opacity
│   ├── رنگ و تصویر پس‌زمینه: background-color، background-image
│   └── اندازه و جایگاه پس‌زمینه: background-size، background-position، background-repeat
├── Border & Outline [border-outline]
│   ├── حاشیه: border-width، border-style، border-color
│   ├── گوشه‌ها: border-radius
│   └── خط بیرونی: outline-width، outline-style، outline-color، outline-offset
├── Shadow [shadow]
│   ├── سایهٔ جعبه: box-shadow
│   └── سایهٔ متن: text-shadow
├── Effects & Filters [effects]
│   ├── فیلتر: filter، backdrop-filter
│   └── ترکیب رنگ: mix-blend-mode، background-blend-mode
├── Masking & Clipping [masking]
│   ├── برش: clip-path
│   └── ماسک: mask-image، mask-size، mask-position، mask-repeat
├── Transform [transform]
│   ├── جابه‌جایی، چرخش و مقیاس: translate، rotate، scale
│   ├── تبدیل دوبعدی/سه‌بعدی: transform، transform-origin
│   └── عمق: perspective، transform-style
├── Overflow & Scrolling [overflow]
│   ├── سرریز محورها: overflow-x، overflow-y
│   ├── پیمایش: scroll-behavior، scrollbar-width
│   └── مهار پیمایش: overscroll-behavior، scrollbar-gutter
├── Scroll Snap & Behavior [scroll-snap]
│   ├── نوع و محور: scroll-snap-type
│   ├── موقعیت فرزند: scroll-snap-align، scroll-snap-stop
│   └── حاشیه و فاصلهٔ پیمایش: scroll-margin، scroll-padding
├── Visibility [visibility]
│   ├── نمایش و دیده‌شدن: visibility، display، opacity
│   ├── برش دیداری: clip، clip-path
│   └── محتوای خارج از صفحهٔ دسترس‌پذیر: content-visibility
├── Interaction & Cursor [interaction]
│   ├── اشاره‌گر: cursor
│   ├── رویدادهای اشاره‌گر: pointer-events، touch-action
│   └── انتخاب و تعامل: user-select، resize
├── Transitions & Animation [transition]
│   ├── گذار: transition-property، transition-duration
│   ├── منحنی و تأخیر: transition-timing-function، transition-delay
│   └── پویانمایی: animation-name، animation-duration، animation-iteration-count، animation-fill-mode
├── Lists & Markers [list]
│   ├── نشانگر: list-style-type، list-style-position، list-style-image
│   └── ظاهر نشانگر: ::marker، marker-side
├── Tables [table]
│   ├── چیدمان جدول: table-layout، border-collapse، border-spacing
│   └── اندازه و عنوان: caption-side، empty-cells
├── Generated Content [content]
│   ├── محتوای پیش/پس از المان: ::before، ::after، content
│   └── شمارنده‌ها: counter-reset، counter-increment، counter()
├── States & Pseudo-classes [states]
│   ├── وضعیت‌های تعاملی: :hover، :focus، :focus-visible، :active
│   ├── ساختاری: :first-child، :last-child، :nth-child()
│   └── انتخاب شرطی: :not()، :is()، :has()
├── Form Controls [forms]
│   ├── ظاهر کنترل: appearance، accent-color
│   ├── ورودی‌ها و انتخاب‌گرها: input، select، textarea، button
│   └── نشانگرهای اعتبارسنجی: :checked، :disabled، :valid، :invalid
├── Containment & Container Queries [containment]
│   ├── مهار: contain، contain-intrinsic-size
│   ├── تعریف محفظه: container-name، container-type
│   └── پرس‌وجوی محفظه: @container و شرط‌های اندازه
├── Custom Properties [custom-properties]
│   ├── متغیرهای CSS: --name و var()
│   ├── مقدار جایگزین و ارث‌بری: var(--name, fallback)، inherit
│   └── ثبت نوع متغیر: @property، syntax، inherits، initial-value
├── Responsive & Object Fit [responsive]
│   ├── ابعاد واکنش‌گرا: inline-size، block-size
│   └── جایگاه و تناسب رسانه: object-fit، object-position
├── SVG Paint & Stroke [svg]
│   ├── نقاشی: fill، stroke
│   └── هندسهٔ خط: stroke-width، stroke-linecap، stroke-linejoin، stroke-dasharray
├── Logical Properties [logical]
│   ├── اندازهٔ منطقی: inline-size، block-size، min/max-inline-size
│   ├── فاصله‌های منطقی: margin-inline/block، padding-inline/block
│   └── حاشیه‌های منطقی: border-inline-start/end
├── Accessibility & Motion [accessibility]
│   ├── حرکت و حالت کاهش حرکت: animation-duration، transition-duration
│   ├── دسترس‌پذیری فوکوس: outline-width/style/offset
│   └── هماهنگی رنگ اجباری: forced-color-adjust
└── View Transitions [view-transitions]
    ├── نام انتقال نمای: view-transition-name
    └── کلاس انتقال نمای: view-transition-class
```

## قواعد نمایش کنترل‌ها

- هر کنترل باید به المان انتخاب‌شده اعمال شود و نتیجه را بلافاصله در پیش‌نمایش نشان دهد.
- کنترل‌ها باید مقدار فعلی CSS المان را بخوانند؛ مقدار فعلی خارج از گزینه‌های پیشنهادی نیز باید در فهرست حفظ شود.
- هیچ فیلدی نباید خالی رندر شود؛ گزینه‌های اولیهٔ معتبر، گزینه‌های آماده و پیشنهادهای قابل انتخاب در فهرست ارائه شوند.
- واحد پیش‌فرض ویژگی‌های عددی طولی `px` و ویژگی‌های زمانی `ms` است؛ اگر کاربر واحد را خودش وارد کند، نباید واحد دیگری افزوده شود.
- تغییرات باید در CSS پروژه ثبت شوند و با تغییر یا انتخاب دوبارهٔ المان از بین نروند.
- برای مقادیر طول، رنگ، زاویه و زمان، گزینه‌های رایج و مقادیر معتبر CSS قابل انتخاب یا ورود باشند.
- گروه‌هایی که بر فرزندان یا شبه‌المان‌ها اثر می‌گذارند، باید هدف اعمال را روشن کنند و تغییر CSS را در جای درست ثبت کنند.