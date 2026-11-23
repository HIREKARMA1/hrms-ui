/**

 * Group heading above settings card grids on Payroll Settings tab.

 * Separates salary rules from variable pay and settlement rules.

 */



type SettingsSectionHeadingProps = {

  title: string

  description?: string

}



export function SettingsSectionHeading({ title, description }: SettingsSectionHeadingProps) {

  return (

    <div className="border-l-[3px] border-hrms-primary pl-4">

      <h2 className="text-lg font-semibold text-hrms-navy">{title}</h2>

      {description ? (

        <p className="mt-1 text-sm text-hrms-text-secondary">{description}</p>

      ) : null}

    </div>

  )

}

