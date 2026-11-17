import type { RequestStatus } from '../types';
import { getActiveStepIndex, STEPPER_STEPS } from '../utils/status';

const COMPLETED_COLOR = '#106f35';
const CURRENT_COLOR = '#67c185';
const CURRENT_BORDER = '#0c5a2b';
const UPCOMING_COLOR = '#e6e9ed';
const ARROW = 12;
const CURRENT_BORDER_FILTER = 'current-stage-border';

type StageState = 'done' | 'current' | 'upcoming';

function stageState(index: number, active: number, isFinal: boolean): StageState {
  if (isFinal || index < active) return 'done';
  if (index === active) return 'current';
  return 'upcoming';
}

function chevronClip(index: number) {
  if (index === 0) {
    return `polygon(${ARROW}px 0, 100% 0, 100% 100%, ${ARROW}px 100%, 0 50%)`;
  }
  return `polygon(${ARROW}px 0, 100% 0, calc(100% - ${ARROW}px) 50%, 100% 100%, ${ARROW}px 100%, 0 50%)`;
}

const STAGE_CLASS: Record<StageState, string> = {
  done: 'text-white',
  current: 'text-white',
  upcoming: 'text-[#9aa1a9]',
};

export function Stepper({ status }: { status: RequestStatus }) {
  const active = getActiveStepIndex(status);
  const isFinal = status === 'accepted' || status === 'rejected';

  return (
    <section className="relative rounded-xl border border-border bg-white px-4 py-3 shadow-sm">
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <filter
          id={CURRENT_BORDER_FILTER}
          x="-20%"
          y="-50%"
          width="140%"
          height="200%"
          colorInterpolationFilters="sRGB"
        >
          <feMorphology
            in="SourceAlpha"
            operator="dilate"
            radius="2"
            result="dilated"
          />
          <feFlood floodColor={CURRENT_BORDER} result="flood" />
          <feComposite in="flood" in2="dilated" operator="in" result="outline" />
          <feMerge>
            <feMergeNode in="outline" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </svg>
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <h3 className="text-sm font-extrabold" style={{ color: COMPLETED_COLOR }}>
          مراحل الطلب
        </h3>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <li className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: COMPLETED_COLOR }}
            />
            المرحلة مكتملة
          </li>
          <li className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: CURRENT_COLOR }}
            />
            المرحلة الحالية
          </li>
          <li className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: '#c5c9d0' }}
            />
            المرحلة المستقبلية
          </li>
        </ul>
      </div>

      <ol className="flex items-center overflow-x-auto py-1">
        {STEPPER_STEPS.map((step, index) => {
          const state = stageState(index, active, isFinal);
          const isCurrent = state === 'current';
          return (
            <li
              key={step.key}
              className="relative shrink-0"
              style={{
                marginRight: index === 0 ? 0 : -ARROW,
                zIndex: isCurrent ? 30 : STEPPER_STEPS.length - index,
                filter: isCurrent ? `url(#${CURRENT_BORDER_FILTER})` : undefined,
              }}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span
                className={`flex h-9 items-center justify-center whitespace-nowrap text-xs font-bold ${STAGE_CLASS[state]}`}
                style={{
                  backgroundColor:
                    state === 'done'
                      ? COMPLETED_COLOR
                      : isCurrent
                        ? CURRENT_COLOR
                        : UPCOMING_COLOR,
                  clipPath: chevronClip(index),
                  paddingInlineStart: index === 0 ? 16 : 22,
                  paddingInlineEnd: 22,
                }}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
