/**

 * Maps POST /leave-encashments errors into employee-friendly copy (My Leave dialog).

 */



const FALLBACK =

  'We could not submit your encashment request. Please try again or contact HR. Your leave balance was not changed.'



const NO_ACTIVE_POLICY =

  'This leave type is not open for encashment right now. HR must set up encashment rules (including payout rate) before you can submit. Please contact HR or try another leave type. Your leave balance was not changed.'



const NOT_ENOUGH_BALANCE =

  'You do not have enough leave balance for this request. Your leave balance was not changed.'



function mentionsPolicySetup(blob: string): boolean {

  return (

    blob.includes('no active encashment policy') ||

    blob.includes('leaveencashmentpolicy') ||

    blob.includes('rateperday') ||

    blob.includes('payroll fields are not available') ||

    blob.includes('configure leaveencashmentpolicy')

  )

}



/** @param apiMessage Text from getLeaveErrorMessage / backend `message` field */

export function formatEncashmentSubmitError(apiMessage: string): string {

  const trimmed = apiMessage.trim()

  if (!trimmed) return FALLBACK



  const blob = trimmed.toLowerCase()



  if (mentionsPolicySetup(blob)) return NO_ACTIVE_POLICY



  if (

    blob.includes('not enough balance') ||

    blob.includes('insufficient balance') ||

    blob.includes('exceeds') && blob.includes('balance')

  ) {

    return NOT_ENOUGH_BALANCE

  }



  if (blob.includes('max') && (blob.includes('per request') || blob.includes('per year'))) {

    return 'This request exceeds the maximum days allowed for encashment. Adjust the number of days or contact HR. Your leave balance was not changed.'

  }



  if (blob.includes('minimum') && blob.includes('balance')) {

    return 'You must keep a minimum leave balance after encashment. Reduce the number of days or contact HR. Your leave balance was not changed.'

  }



  if (blob.includes('forbidden') || blob.includes('not authorized')) {

    return 'You are not allowed to submit an encashment request. Contact HR if you need access.'

  }



  const looksTechnical =

    blob.includes('schema') ||

    blob.includes('configure ') ||

    blob.includes('rateperday') ||

    trimmed.length > 220



  if (looksTechnical) return FALLBACK



  return trimmed

}



export const ENCASHMENT_SUBMIT_FAIL_TOAST = 'Encashment request could not be submitted.'
