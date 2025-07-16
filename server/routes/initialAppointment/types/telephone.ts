import { Expose } from 'class-transformer'
import { IsNotEmpty, Matches } from 'class-validator'

/*
  Regular expression breakdown:

  /^                                        → Start of string
  (                                         → Start of full phone number group
    (                                       → Start of area code group
      \+44\s?[1-9]\d{1,4}                   → "+44" followed by optional space and 2–5 digits (can't start with 0)
      |                                     → OR
      \(0\d{2,5}\)                          → Area code with parentheses, e.g. "(020)", "(0113)"
      |                                     → OR
      0\d{2,5}                              → Area code without parentheses, e.g. "020", "0113"
    )                                       → End of area code group
    \s?\d{3,4}                              → Optional space, then 3–4 digit block (first part of local number)
    \s?\d{3,4}                              → Optional space, then 3–4 digit block (second part of local number)
  )                                         → End of full phone number group

  (                                         → Start of optional extension group
    \s?                                     → Optional space before extension
    (?:#|ext|x)                             → Must be "#", "ext", or "x" (note: "ext." is not allowed)
    \s?\d{1,5}                              → Optional space, then 1–5 digit extension number
  )?                                        → Extension group is optional

  $/                                        → End of string
*/
class Telephone {
  @Expose()
  @IsNotEmpty({ message: 'Enter a phone number' })
  @Matches(/^((\+44\s?[1-9]\d{1,4}|\(0\d{2,5}\)|0\d{2,5})\s?\d{3,4}\s?\d{3,4})(\s?(?:#|ext|x)\s?\d{1,5})?$/, {
    message: 'Enter a phone number in the correct format, like 01632 960901',
  })
  telephone: string
}

export default Telephone
