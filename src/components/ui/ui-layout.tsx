"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { ReactNode, Suspense, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";

import { AccountChecker } from "../account/account-ui";
import { ClusterChecker, ExplorerLink } from "../cluster/cluster-ui";
import { WalletButton } from "../solana/solana-provider";

export function UiLayout({
  children,
  links,
}: {
  children: ReactNode;
  links: { label: string; path: string }[];
}) {
  const pathname = usePathname();

  return (
    <div className="h-full flex flex-col">
      <div className="navbar bg-base-300 text-neutral-content flex-col md:flex-row space-y-2 md:space-y-0 fixed top-0 left-0 right-0 z-50">
        <div className="flex-1">
          <Link className="btn btn-ghost normal-case text-xl" href="/">
            <img
              className="h-8 w-8 md:h-10 md:w-10 rounded-full object-cover"
              alt="Logo"
              src="/attn.png"
            />
          </Link>
          <ul className="menu menu-horizontal px-1 space-x-2">
            {links.map(({ label, path }) => (
              <li key={path}>
                <Link
                  className={pathname.startsWith(path) ? "active" : ""}
                  href={path}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-none space-x-2">
          <WalletButton />
        </div>
      </div>
      <div className="p-8"></div>
      <ClusterChecker>
        <AccountChecker />
      </ClusterChecker>
      <div className="flex-grow">
        <Suspense
          fallback={
            <div className="text-center my-32">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          }
        >
          {children}
        </Suspense>
        <Toaster position="bottom-right" />
      </div>
      <footer className="footer footer-center p-4 bg-base-300 text-base-content flex justify-between items-center">
        <aside>
          <p>
            A{" "}
            <a
              className="link hover:text-white"
              href="https://x.com/harkl_"
              target="_blank"
              rel="noopener noreferrer"
            >
              harkl
            </a>
            {" joint"}
          </p>
        </aside>
        <div className="flex space-x-4">
          <a
            href="https://x.com/harkl_"
            target="_blank"
            rel="noopener noreferrer"
            className="text-base-content hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
            </svg>
          </a>
          <a
            href="https://app.meteora.ag/pools/FA2p7ft4cNFAC91s3qE5DCuMTEexU7H8SkgEW2cEy4i7"
            target="_blank"
            rel="noopener noreferrer"
            className="text-base-content hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 122 122"
              fill="none"
            >
              <g clip-path="url(#clip0_11198_152623)">
                <mask
                  id="mask0_11198_152623"
                  maskUnits="userSpaceOnUse"
                  x="-27"
                  y="0"
                  width="150"
                  height="151"
                  style={{ maskType: "alpha" }}
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M100.312 84.4182C113.53 76.513 122.381 62.058 122.381 45.5358C122.381 20.5326 102.112 0.26355 77.109 0.26355C59.4615 0.26355 44.1723 10.361 36.7039 25.0936L-27 88.7975L34.4661 150.264L100.312 84.4182Z"
                    fill="#795E5E"
                  />
                </mask>
                <g mask="url(#mask0_11198_152623)">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M76.3516 -3.01237L76.3753 -3.03661C69.2388 -2.90286 62.3452 -0.980157 56.417 2.78007C51.9711 7.50721 47.6204 12.3296 43.4097 17.2841C38.8259 22.6661 34.4042 28.1945 30.1979 33.9066C28.633 36.0521 27.0913 38.2287 25.6357 40.4916C27.8986 39.036 30.0752 37.4943 32.2207 35.9294C34.7519 34.0604 37.2508 32.1511 39.7134 30.2055C51.75 20.7088 63.028 10.3107 73.8609 -0.476867C74.6929 -1.31778 75.5203 -2.16313 76.3516 -3.01237ZM71.0149 25.2391C79.0445 17.1188 86.9999 8.90035 94.7302 0.480642C91.5026 -0.836267 88.1896 -1.78661 84.8722 -2.36073C77.7178 4.30389 70.7 11.1131 63.7581 17.9823C55.771 26.0421 47.8626 34.2044 40.1793 42.5681C29.0377 54.6802 18.3474 67.212 8.51872 80.4785C20.5035 71.596 31.8958 62.0179 42.9094 52.0293C52.5083 43.3375 61.8288 34.3436 71.0149 25.2391ZM108.512 8.86882C97.1792 21.4166 85.4274 33.5766 73.5339 45.5791C66.3989 52.6596 59.2095 59.6857 51.9153 66.599C35.9828 81.7059 19.5543 96.293 2.11832 109.738C15.8706 91.9036 30.819 75.1229 46.2963 58.8473C52.8795 51.9285 59.5534 45.1005 66.2771 38.3223C77.9822 26.726 89.8398 15.2585 102.054 4.18724C104.287 5.55573 106.448 7.11399 108.512 8.86882ZM119.176 21.1543C117.792 18.9375 116.214 16.7965 114.448 14.7529C101.892 26.0931 89.72 37.8568 77.7097 49.7583C70.6252 56.8972 63.5912 64.0945 56.67 71.3967C41.567 87.3252 26.9923 103.75 13.5509 121.174C31.3528 107.445 48.1104 92.5286 64.3582 77.0791C71.3047 70.4682 78.1605 63.7665 84.9665 57.015C96.5905 45.2822 108.082 33.4008 119.176 21.1543ZM122.933 28.432C124.277 31.6149 125.258 34.8877 125.872 38.1653C119.137 45.4081 112.24 52.5047 105.292 59.5343C97.1532 67.6008 88.9071 75.5839 80.4556 83.3459C68.4227 94.4082 55.9697 105.011 42.7961 114.774C51.6356 102.841 61.1707 91.5008 71.1156 80.5309C79.8419 70.8793 88.8834 61.5113 98.0355 52.2775C106.199 44.2043 114.461 36.2053 122.933 28.432ZM121.741 65.6747C125.009 59.9038 126.636 53.333 126.658 46.5528C125.681 47.5025 124.709 48.4567 123.745 49.4115C112.834 60.3673 102.327 71.7733 92.7426 83.9606C90.907 86.2952 89.107 88.6576 87.3387 91.0517C85.7698 93.2011 84.2321 95.3738 82.7765 97.6367C85.0394 96.1812 87.216 94.6395 89.3615 93.0745C94.6097 89.2051 99.7105 85.1566 104.683 80.9641C110.529 76.0434 116.201 70.9248 121.741 65.6747Z"
                    fill="url(#paint0_linear_11198_152623)"
                  />
                </g>
              </g>
              <defs>
                <linearGradient
                  id="paint0_linear_11198_152623"
                  x1="102.438"
                  y1="273.932"
                  x2="252.044"
                  y2="95.6716"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="#FF2189" />
                  <stop offset="1" stop-color="#FF9D00" />
                </linearGradient>
                <clipPath id="clip0_11198_152623">
                  <rect width="122" height="122" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </a>
          <a
            href="https://birdeye.so/token/7KBaynnEyvEbernyc2CMDMoUh5edF3Sgw8qKELt3jtD?chain=solana&tab=recentTrades"
            target="_blank"
            rel="noopener noreferrer"
            className="text-base-content hover:text-white"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 266.66666 266.66666"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <clipPath clipPathUnits="userSpaceOnUse" id="clipPath16">
                  <path d="M 0,200 H 200 V 0 H 0 Z" />
                </clipPath>
              </defs>
              <g transform="matrix(1.3333333,0,0,-1.3333333,0,266.66667)">
                <g>
                  <g clipPath="url(#clipPath16)">
                    <g transform="translate(157.7549,65.4019)">
                      <path
                        d="m 0,0 c -1.934,-19.607 -17.792,-35.464 -37.399,-37.375 -26.485,-2.627 -48.528,19.417 -45.925,45.925 1.935,19.607 17.792,35.464 37.399,37.399 C -19.416,48.552 2.627,26.509 0,0 m -11.344,67.06 c -10.309,5.546 -15.451,17.386 -10.842,28.157 l 16.812,39.381 h -42.819 l -95.37,-190.952 c 0,0 40.221,14.242 66.21,0.733 11.964,-6.218 25.338,-10.532 39.978,-9.671 34.461,2.053 61.997,28.658 65.126,63.047 2.77,30.354 -13.723,55.656 -39.095,69.305"
                        style={{
                          fill: "currentColor",
                          fillOpacity: 1,
                          fillRule: "nonzero",
                          stroke: "none",
                        }}
                      />
                    </g>
                    <g transform="translate(135.8936,67.6504)">
                      <path
                        d="m 0,0 c -0.919,-9.318 -8.456,-16.854 -17.774,-17.762 -12.587,-1.249 -23.062,9.227 -21.825,21.825 0.919,9.318 8.455,16.854 17.773,17.774 C -9.228,23.074 1.249,12.598 0,0"
                        style={{
                          fill: "#ff6d00",
                          fillOpacity: 1,
                          fillRule: "nonzero",
                          stroke: "none",
                        }}
                      />
                    </g>
                  </g>
                </g>
              </g>
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}

export function AppModal({
  children,
  title,
  hide,
  show,
  submit,
  submitDisabled,
  submitLabel,
}: {
  children: ReactNode;
  title: string;
  hide: () => void;
  show: boolean;
  submit?: () => void;
  submitDisabled?: boolean;
  submitLabel?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (!dialogRef.current) return;
    if (show) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current.close();
    }
  }, [show, dialogRef]);

  return (
    <dialog className="modal" ref={dialogRef}>
      <div className="modal-box space-y-5">
        <h3 className="font-bold text-lg">{title}</h3>
        {children}
        <div className="modal-action">
          <div className="join space-x-2">
            {submit ? (
              <button
                className="btn btn-xs lg:btn-md btn-primary"
                onClick={submit}
                disabled={submitDisabled}
              >
                {submitLabel || "Save"}
              </button>
            ) : null}
            <button onClick={hide} className="btn">
              Close
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

export function AppHero({
  children,
  title,
  subtitle,
}: {
  children?: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
}) {
  return (
    <div className="hero">
      <div className="hero-content text-center">
        <div className="max-w-2xl">
          {typeof title === "string" ? (
            <h1 className="text-5xl font-bold">{title}</h1>
          ) : (
            title
          )}
          {typeof subtitle === "string" ? (
            <p className="py-6">{subtitle}</p>
          ) : (
            subtitle
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

export function ellipsify(str = "", len = 4) {
  if (str.length > 30) {
    return (
      str.substring(0, len) + ".." + str.substring(str.length - len, str.length)
    );
  }
  return str;
}

export function useTransactionToast() {
  return (signature: string) => {
    toast.success(
      <div className={"text-center"}>
        <div className="text-lg">Transaction sent</div>
        <ExplorerLink
          path={`tx/${signature}`}
          label={"View Transaction"}
          className="btn btn-xs btn-primary"
        />
      </div>
    );
  };
}
