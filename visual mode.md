# گروه‌ها و تنظیمات ویرایشگر بصری

این سند گروه‌ها و کنترل‌های ثبت‌شده در `index.html`، فایل‌های `js/visual/groups/` و `js/visual/visual-catalog.js` را توصیف می‌کند. ترتیب زیر همان ترتیب فعلی منو است و از تنظیمات رایج به تنظیمات تخصصی‌تر می‌رود.

> **پوشش فعلی:** ۳۳ گروه در پنج دستهٔ Essentials، Layout، Effects، Content و Advanced. دستهٔ Essentials با تنظیمات رایج و Quick Style باز می‌شود. بخش‌های Quick Style برای خلوت‌ماندن پنل جمع‌شونده‌اند. این گروه تنظیمات اصلی چیدمان و اندازه، فاصله‌گذاری، تایپوگرافی، پس‌زمینه، حاشیه و جلوه‌ها را در یک جا گرد آورده است. برای یافتن مستقیم یک ویژگی، نام آن یا نام CSS آن را در Find a setting جست‌وجو کنید؛ نتیجه گروه مناسب را نشان می‌دهد و کنترل متناظر را مشخص می‌کند. ابتدا یک المان را در پیش‌نمایش انتخاب کنید؛ تا پیش از انتخاب المان، کنترل‌های وابسته غیرفعال هستند. کنترل‌های انتخابی گزینه‌های آماده دارند؛ فیلدهای متنی نیز پیشنهادهای قابل انتخاب و امکان ورود مقدار دلخواه CSS را فراهم می‌کنند. رنگ‌ها انتخابگر بومی و فیلد متنی دارند و ویژگی‌های عددیِ دارای بازه، اسلایدر و فیلد مقدار دارند. فیلدها با مقدار اولیهٔ غیرخالی ساخته می‌شوند. در ویژگی‌های طولیِ پشتیبانی‌شده، واحد فقط هنگام ثبت مقدار اضافه می‌شود: عدد بدون واحد به `px` و زمان‌های انیمیشن/گذار به `ms` تبدیل می‌شوند؛ واحدی که کاربر خودش وارد کند حفظ می‌شود. مقدارها پیش از ثبت اعتبارسنجی می‌شوند. `Reset` تغییر ویرایشگر بصری را برمی‌گرداند: مقدار قبلی ویژگی در همان قانون CSS حفظ می‌شود یا، اگر قانون را ویرایشگر ساخته باشد، فقط همان ویژگی و در صورت خالی‌شدن قانون، همان قانون تولیدشده حذف می‌شود.

> **انتخاب پیشنهادها:** برای دیدن و انتخاب هر preset، حتی وقتی فیلد از قبل مقدار دارد، از دکمهٔ فلش کنار نام ویژگی استفاده کنید. انتخاب preset جدید نیازی به پاک‌کردن دستی مقدار فعلی ندارد؛ ورود مقدار دلخواه نیز همچنان از خود فیلد امکان‌پذیر است.

> **ثبت CSS:** اگر قانون CSS موجود در ویرایشگر با المان انتخاب‌شده مطابقت داشته باشد، ویژگی در همان قانون به‌روزرسانی می‌شود؛ در غیر این صورت یک قانون عادی CSS با selector المان ساخته می‌شود. فقط declaration مربوط به ویژگی تغییر می‌کند و بقیه CSS حفظ می‌شود. برای غلبه بر inline style معمولی، مقدار با `!important` ثبت می‌شود. اگر ویژگی دارای inline `!important` باشد، تغییر آن رد می‌شود و پیام خطا نشان داده می‌شود. markerهای معتبر نسخه‌های قدیمی هنگام اولین تغییر به CSS عادی تبدیل می‌شوند؛ marker ناقص، تکراری یا ناسازگار بدون تغییر باقی می‌ماند.

## ترتیب منو و کنترل‌های پیاده‌سازی‌شده

1. **Color & Background** (`color-background`)
   - رنگ و شفافیت: `color`، `opacity`
   - پس‌زمینه: `background-color`، `background-image`، `background-blend-mode`، `background-size`، `background-position`، `background-repeat`
   - تنظیمات تکمیلی: `background-attachment`، `background-origin`، `background-clip`، `background-position-x`، `background-position-y`

2. **Spacing** (`spacing`)
   - حاشیهٔ بیرونی: `margin`، `margin-block`، `margin-inline`
   - فاصلهٔ درونی: `padding`، `padding-block`، `padding-inline`
   - فاصله‌ها: `gap`، `row-gap`، `column-gap`، `scroll-margin`، `scroll-padding`

3. **Typography** (`typography`)
   - قلم: `font-family`، `font-size`، `font-weight`، `font-style`، `font-stretch`، `font-variant`
   - فاصله‌گذاری: `line-height`، `letter-spacing`، `word-spacing`
   - تزئین متن: `text-decoration-line`، `text-decoration-style`، `text-decoration-color`، `text-decoration-thickness`

4. **Quick Style** (`custom-settings`)
   - چیدمان و اندازه: `display`، `position`، `box-sizing`، `width`، `min-width`، `max-width`، `height`، `min-height`، `max-height`، `z-index`، `overflow`
   - فاصله‌گذاری: `margin`، `padding`، `gap`
   - تایپوگرافی: `color`، `font-family`، `font-size`، `font-weight`، `line-height`، `text-align`
   - پس‌زمینه: `background-color`، `background-image`
   - حاشیه: `border-width`، `border-style`، `border-color`، `border-radius`
   - جلوه‌ها: `opacity`، `box-shadow`، `transform`

5. **Display & Flow** (`layout`)
   - نمایش و جعبه: `display`، `box-sizing`
   - جریان و تراز: `overflow`، `vertical-align`، `place-content`، `float`، `clear`، `direction`، `writing-mode`
   - تراز اجزا: `align-items`، `justify-items`، `align-self`، `place-items`

6. **Sizing** (`sizing`)
   - اندازه و نسبت: `width`، `height`، `aspect-ratio`
   - حداقل/حداکثر: `min-width`، `min-height`، `max-width`، `max-height`، `min-inline-size`، `max-inline-size`، `min-block-size`، `max-block-size`

7. **Border & Outline** (`border-outline`)
   - حاشیه: `border-width`، `border-style`، `border-color`
   - گوشه‌ها: `border-radius`، `border-top-left-radius`، `border-top-right-radius`، `border-bottom-left-radius`، `border-bottom-right-radius`
   - خط بیرونی: `outline-width`، `outline-style`، `outline-color`، `outline-offset`
   - حاشیهٔ هر ضلع: `border-top-width/style/color`، `border-right-width/style/color`، `border-bottom-width/style/color`، `border-left-width/style/color`

8. **Flexbox** (`flexbox`)
   - محور: `flex-direction`، `flex-wrap`
   - تراز و توزیع: `justify-content`، `align-items`، `align-content`، `align-self`، `justify-items`
   - اندازه و ترتیب فرزند: `flex-grow`، `flex-shrink`، `flex-basis`، `order`
   - جریان و فاصله: `flex-flow`، `row-gap`، `column-gap`

9. **Grid** (`grid`)
   - ساختار: `grid-template-columns`، `grid-template-rows`، `grid-template-areas`
   - فاصله‌ها: `gap`، `column-gap`، `row-gap`
   - جایگاه فرزند: `grid-column`، `grid-row`، `grid-area`، `justify-self`، `align-self`
   - چیدمان خودکار و تراز: `grid-auto-flow`، `grid-auto-columns`، `grid-auto-rows`، `align-items`، `justify-items`، `place-items`

10. **Positioning** (`positioning`)
    - موقعیت و لایه: `position`، `z-index`
    - مختصات فیزیکی: `top`، `right`، `bottom`، `left`، `inset`
    - مختصات منطقی: `inset-block-start`، `inset-block-end`، `inset-inline-start`، `inset-inline-end`

11. **Text & Writing** (`text`)
    - تراز و جهت: `text-align`، `direction`، `text-indent`، `vertical-align`
    - شکست و سرریز: `white-space`، `overflow-wrap`، `word-break`، `text-overflow`، `hyphens`
    - تزئین: `text-transform`، `text-decoration`، `text-shadow`
    - فاصله‌گذاری: `word-spacing`

12. **Shadow** (`shadow`)
    - برای شروع، presetهای سایهٔ ملایم، برجسته، عمیق، داخلی، دورخط، درخشش و چندلایه را انتخاب کنید.
    - در `Customize layers` می‌توانید برای هر لایه offset افقی/عمودی، blur، رنگ، و در سایهٔ جعبه spread و حالت `inset` را تنظیم کنید؛ لایه‌ها را اضافه، حذف و جابه‌جا کنید.
    - `Advanced CSS value` ورود مستقیم هر مقدار معتبر CSS را می‌پذیرد؛ چند سایه با ویرگول جدا می‌شوند و مقدارهای پیشرفته مثل رنگ‌های جدید، `calc()` و متغیرها حفظ می‌شوند.
    - `text-shadow` فقط offset، blur و رنگ دارد؛ `inset` و spread مخصوص `box-shadow` هستند. مقادیر نامعتبر اعمال نمی‌شوند و مقدار معتبر قبلی باقی می‌ماند.

13. **Effects & Filters** (`effects`)
    - فیلترها: `filter`، `backdrop-filter`
    - ترکیب و جداسازی: `mix-blend-mode`، `isolation`
    - شدت اثر: `opacity`

14. **Transform** (`transform`)
    - تبدیل‌های مستقل: `translate`، `rotate`، `scale`
    - تبدیل و مبدأ: `transform`، `transform-origin`، `transform-box`
    - سه‌بعدی: `perspective`، `transform-style`، `backface-visibility`، `perspective-origin`

15. **Responsive** (`responsive`)
    - اندازهٔ منطقی: `inline-size`، `block-size`
    - تناسب رسانه: `object-fit`، `object-position`
    - محدودیت اندازه: `min-width`، `max-width`، `min-height`، `max-height`، `aspect-ratio`

16. **Interaction & Cursor** (`interaction`)
    - اشاره‌گر: `cursor`، `pointer-events`
    - لمس و انتخاب: `touch-action`، `user-select`، `resize`

17. **Visibility** (`visibility`)
    - دیده‌شدن و رندر: `visibility`، `opacity`، `content-visibility`
    - برش: `clip`، `clip-path`
    - اندازهٔ ذاتی محتوا: `contain-intrinsic-size`

18. **Overflow & Scrolling** (`overflow`)
    - سرریز محورها: `overflow-x`، `overflow-y`
    - پیمایش: `scroll-behavior`، `overscroll-behavior`، `scrollbar-gutter`
    - رفتار محوری: `overscroll-behavior-x`، `overscroll-behavior-y`

19. **Form Controls** (`forms`)
    - ظاهر: `appearance`، `accent-color`
    - اندازه: `inline-size`، `block-size`
    - تعامل ورودی: `caret-color`، `resize`
    - رنگ و اندازهٔ کنترل: `color-scheme`، `field-sizing`

20. **Columns** (`columns`)
    - چیدمان ستون: `column-count`، `column-width`
    - فاصله و جداکننده: `column-gap`، `column-rule-width`، `column-rule-style`، `column-rule-color`، `column-rule`
    - امتداد ستون: `column-span`

21. **Containment & Container Queries** (`containment`)
    - مهار: `contain`، `contain-intrinsic-inline-size`، `contain-intrinsic-block-size`
    - محفظه: `container-name`، `container-type`
    - رندر و بهینه‌سازی: `content-visibility`، `contain-intrinsic-size`، `will-change`

22. **Custom Properties** (`custom-properties`)
    - فیلد نام و مقدار متغیر CSS (`--name`).
    - نام متغیر را انتخاب یا وارد کنید، سپس مقدار آن را برای المان انتخاب‌شده تعیین کنید.
    - تغییر نامِ متغیری که همین کنترل در نشست جاری ساخته، override قبلیِ همان المان را حذف می‌کند؛ ارجاع‌های موجود در CSS/HTML به‌طور خودکار بازنویسی نمی‌شوند.

23. **Transitions & Animation** (`transition`)
    - گذار: `transition-property`، `transition-duration`، `transition-timing-function`، `transition-delay`
    - پویانمایی: `animation-name`، `animation-duration`، `animation-iteration-count`، `animation-direction`، `animation-fill-mode`، `animation-timing-function`، `animation-delay`، `animation-play-state`

24. **Scroll Snap & Behavior** (`scroll-snap`)
    - محفظه: `scroll-snap-type`، `scroll-snap-stop`، `scroll-behavior`
    - هدف پیمایش: `scroll-snap-align`
    - فاصله‌ها: `scroll-margin`، `scroll-padding`

25. **Lists & Markers** (`list`)
    - ظاهر فهرست: `list-style-type`، `list-style-position`، `list-style-image`
    - جای نشانگر: `marker-side`

26. **Tables** (`table`)
    - چیدمان: `table-layout`، `border-collapse`، `border-spacing`
    - سلول و عنوان: `caption-side`، `empty-cells`

27. **States & Pseudo-classes** (`states`)
    - ظاهر تعاملی: `accent-color`، `caret-color`، `user-select`
    - ظاهر فوکوس: `outline-style`، `outline-color`
    - رفتار اشاره‌گر: `pointer-events`

28. **Generated Content** (`content`)
    - محتوا و نقل‌قول: `content`، `quotes`
    - شمارنده‌ها: `counter-reset`، `counter-increment`
    - جریان متن: `white-space`

29. **SVG** (`svg`)
    - رنگ‌آمیزی: `fill`، `stroke`
    - هندسهٔ خط: `stroke-width`، `stroke-linecap`، `stroke-linejoin`، `stroke-dasharray`

30. **Logical** (`logical`)
    - اندازه: `inline-size`، `block-size`، `min-inline-size`، `max-inline-size`، `min-block-size`، `max-block-size`
    - فاصله: `margin-inline`، `margin-block`، `padding-inline`، `padding-block`
    - حاشیه: `border-inline-start`، `border-inline-end`

31. **Masking & Clipping** (`masking`)
    - برش: `clip-path`
    - ماسک: `mask-image`، `mask-size`، `mask-position`، `mask-repeat`

32. **Accessibility** (`accessibility`)
    - زمان‌بندی حرکت: `animation-duration`، `transition-duration`، `scroll-behavior`
    - فوکوس: `outline-width`، `outline-style`، `outline-offset`، `outline-color`
    - رنگ اجباری: `forced-color-adjust`

33. **View Transitions** (`view-transitions`)
    - ثبت انتقال: `view-transition-name`، `view-transition-class`

## رفتار و محدودهٔ کنترل‌ها

- کنترل انتخابی گزینه‌های آماده دارد؛ کنترل متنی پیشنهادها را نشان می‌دهد و مقدار دلخواه را هم می‌پذیرد.
- مقدار اولیهٔ هر فیلد غیرخالی است. اگر مقدار محاسبه‌شدهٔ المان در گزینه‌های یک فهرست نباشد، به‌صورت گزینهٔ `Current:` به همان فهرست افزوده می‌شود.
- عدد بدون واحد در ویژگی‌های طولی پشتیبانی‌شده `px` می‌گیرد و عدد بدون واحد برای مدت انیمیشن/گذار `ms` می‌گیرد. واحد موجود و کلیدواژه‌های CSS حفظ می‌شوند.
- مقدارها روی المان انتخاب‌شده اعمال و در بلاک مدیریت‌شدهٔ CSS ثبت می‌شوند. نام متغیر سفارشی اعتبارسنجی می‌شود و مقدار آن به‌عنوان CSS custom property ذخیره می‌شود.
- گروه States ویژگی‌های پشتیبانی‌شده را روی المان انتخاب‌شده تغییر می‌دهد؛ در حال حاضر قانون جداگانه‌ای برای `:hover`، `:focus` یا شبه‌کلاس‌های دیگر ایجاد نمی‌کند.
- تنظیماتی که به تغییر فرزندها، شبه‌المان‌ها یا at-ruleها نیاز دارند (مانند `@media`، `@container` و `@property`) از کنترل‌های انتخاب المان تولید نمی‌شوند.

## نگهداری

- شناسه، ترتیب، فیلدها و نام ویژگی‌ها را میان این سند، `index.html`، فایل‌های `js/visual/groups/` و `js/visual/visual-catalog.js` هماهنگ نگه دارید.
- متن رابط کاربری باید انگلیسی باشد؛ اگر درخواست به فارسی است، معادل انگلیسی آن را در رابط به‌کار ببرید.
- تعریف اصلی هر گروه در فایل مستقل خودش زیر `js/visual/groups/` بماند و کنترل‌های تکمیلی مشترک در `visual-catalog.js` ثبت شوند.
