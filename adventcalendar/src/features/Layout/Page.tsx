import classNames from "classnames";

interface IPageProps {
  children?: React.ReactNode;
}

export function Page({ children }: IPageProps) {
  return (
    <div
      className={classNames(
        "min-h-screen min-w-screen px-5 py-5",
        "flex flex-col gap-5 items-center justify-center",
        "bg-linear-to-b from-emerald-950 via-emerald-900 to-rose-950 text-rose-50 uppercase"
      )}
    >
      {children}
    </div>
  );
}
