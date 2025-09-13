/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useCallback, useMemo } from 'react';
import * as Icons from './components/icons';

type Tab = 'HOME' | 'NuMIX';

// --- Reusable UI Components ---

const CalculatorButton: React.FC<{
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
  ariaLabel: string;
}> = ({ onClick, className = '', children, ariaLabel }) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    className={`flex items-center justify-center text-3xl font-medium rounded-2xl transform transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 active:scale-95 ${className}`}
  >
    {children}
  </button>
);

const ConverterScaffold: React.FC<{ title: string; onBack: () => void; children: React.ReactNode }> = ({ title, onBack, children }) => (
    <div className="p-6 fade-in text-white h-full flex flex-col">
        <div className="flex items-center mb-6 flex-shrink-0">
            <button onClick={onBack} aria-label="Go back" className="p-2 rounded-full hover:bg-gray-700 active:scale-95 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h2 className="text-2xl font-bold text-center flex-1 pr-8">{title}</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
            {children}
        </div>
    </div>
);

const inputClasses = "w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-blue-500 focus:border-blue-500";
const labelClasses = "block mb-2 text-sm font-medium text-gray-300";


// --- Calculator (HOME) ---

const Calculator: React.FC = () => {
    const [display, setDisplay] = useState('0');
    const [firstOperand, setFirstOperand] = useState<number | null>(null);
    const [operator, setOperator] = useState<string | null>(null);
    const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);

    const inputDigit = (digit: string) => {
        if (waitingForSecondOperand) {
            setDisplay(digit);
            setWaitingForSecondOperand(false);
        } else {
            setDisplay(display === '0' ? digit : display + digit);
        }
    };
    
    const inputDecimal = () => {
        if (!display.includes('.')) {
            setDisplay(display + '.');
        }
    };

    const clearAll = () => {
        setDisplay('0');
        setFirstOperand(null);
        setOperator(null);
        setWaitingForSecondOperand(false);
    };

    const handleOperator = (nextOperator: string) => {
        const inputValue = parseFloat(display);

        if (operator && !waitingForSecondOperand) {
            const result = calculate(firstOperand!, inputValue, operator);
            setDisplay(String(result));
            setFirstOperand(result);
        } else {
            setFirstOperand(inputValue);
        }
        
        setWaitingForSecondOperand(true);
        setOperator(nextOperator);
    };

    const calculate = (first: number, second: number, op: string): number => {
        switch (op) {
            case '+': return first + second;
            case '−': return first - second;
            case '×': return first * second;
            case '÷': return second === 0 ? Infinity : first / second;
            default: return second;
        }
    };
    
    const handleEquals = () => {
        const inputValue = parseFloat(display);
        if (operator && firstOperand !== null) {
            const result = calculate(firstOperand, inputValue, operator);
            setDisplay(String(result));
            setFirstOperand(result); 
            setOperator(null);
            setWaitingForSecondOperand(true);
        }
    };

    const handlePercent = () => {
        const currentValue = parseFloat(display);
        setDisplay(String(currentValue / 100));
    };

    const getDisplayTextSize = () => {
      if (display.length > 12) return 'text-4xl';
      if (display.length > 8) return 'text-5xl';
      return 'text-7xl';
    }

    return (
        <div className="p-6 flex flex-col h-full fade-in">
            <div className="flex-1 flex items-end justify-end pb-4">
                <h1 className={`font-light text-white break-all text-right ${getDisplayTextSize()}`}>{display}</h1>
            </div>
            <div className="calculator-grid">
                <CalculatorButton onClick={clearAll} className="bg-gray-400 text-black hover:bg-gray-300" ariaLabel="Clear">AC</CalculatorButton>
                <CalculatorButton onClick={handlePercent} className="bg-gray-400 text-black hover:bg-gray-300" ariaLabel="Percent">%</CalculatorButton>
                <CalculatorButton onClick={() => handleOperator('÷')} className="bg-gray-400 text-black hover:bg-gray-300" ariaLabel="Divide">÷</CalculatorButton>
                <CalculatorButton onClick={() => handleOperator('×')} className="bg-orange-500 text-white hover:bg-orange-400 focus:ring-orange-400" ariaLabel="Multiply">×</CalculatorButton>
                
                {['7', '8', '9'].map(d => <CalculatorButton key={d} onClick={() => inputDigit(d)} className="bg-gray-700 text-white hover:bg-gray-600" ariaLabel={d}>{d}</CalculatorButton>)}
                <CalculatorButton onClick={() => handleOperator('−')} className="bg-orange-500 text-white hover:bg-orange-400 focus:ring-orange-400" ariaLabel="Subtract">−</CalculatorButton>
                
                {['4', '5', '6'].map(d => <CalculatorButton key={d} onClick={() => inputDigit(d)} className="bg-gray-700 text-white hover:bg-gray-600" ariaLabel={d}>{d}</CalculatorButton>)}
                <CalculatorButton onClick={() => handleOperator('+')} className="bg-orange-500 text-white hover:bg-orange-400 focus:ring-orange-400" ariaLabel="Add">+</CalculatorButton>
                
                {['1', '2', '3'].map(d => <CalculatorButton key={d} onClick={() => inputDigit(d)} className="bg-gray-700 text-white hover:bg-gray-600" ariaLabel={d}>{d}</CalculatorButton>)}
                <CalculatorButton onClick={handleEquals} className="row-span-2 bg-orange-500 text-white hover:bg-orange-400 focus:ring-orange-400" ariaLabel="Equals">=</CalculatorButton>
                
                <CalculatorButton onClick={() => inputDigit('0')} className="col-span-2 bg-gray-700 text-white hover:bg-gray-600" ariaLabel="0">0</CalculatorButton>
                <CalculatorButton onClick={inputDecimal} className="bg-gray-700 text-white hover:bg-gray-600" ariaLabel="Decimal">.</CalculatorButton>
            </div>
        </div>
    );
};

// --- NuMIX Converters ---

const CalorieCalculator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [gender, setGender] = useState('male');
    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [activityLevel, setActivityLevel] = useState('1.2');
    const [calories, setCalories] = useState<number | null>(null);

    const calculateCalories = () => {
        const ageN = parseInt(age);
        const weightN = parseFloat(weight);
        const heightN = parseFloat(height);

        if (!ageN || !weightN || !heightN || ageN <= 0 || weightN <= 0 || heightN <= 0) {
            setCalories(null);
            alert('الرجاء إدخال قيم صحيحة للعمر والوزن والطول.');
            return;
        }

        let bmr: number;
        if (gender === 'male') {
            bmr = 10 * weightN + 6.25 * heightN - 5 * ageN + 5;
        } else {
            bmr = 10 * weightN + 6.25 * heightN - 5 * ageN - 161;
        }

        const calculatedCalories = bmr * parseFloat(activityLevel);
        setCalories(Math.round(calculatedCalories));
    };

    const activityLevels = [
        { value: '1.2', label: 'خامل (عمل مكتبي)' },
        { value: '1.375', label: 'نشاط خفيف (تمرين 1-3 أيام/الأسبوع)' },
        { value: '1.55', label: 'نشاط متوسط (تمرين 3-5 أيام/الأسبوع)' },
        { value: '1.725', label: 'نشاط عالي (تمرين 6-7 أيام/الأسبوع)' },
        { value: '1.9', label: 'نشاط عالٍ جداً (عمل بدني شاق)' },
    ];

    return (
        <ConverterScaffold title="حساب السعرات الحرارية" onBack={onBack}>
            <div className="space-y-4">
                <div>
                    <label className={labelClasses}>الجنس</label>
                    <div className="flex gap-4">
                        <label className={`flex-1 p-3 text-center rounded-lg cursor-pointer transition-colors ${gender === 'male' ? 'bg-blue-600' : 'bg-gray-700'}`}>
                            <input type="radio" name="gender" value="male" checked={gender === 'male'} onChange={(e) => setGender(e.target.value)} className="sr-only" />
                            ذكر
                        </label>
                        <label className={`flex-1 p-3 text-center rounded-lg cursor-pointer transition-colors ${gender === 'female' ? 'bg-pink-500' : 'bg-gray-700'}`}>
                            <input type="radio" name="gender" value="female" checked={gender === 'female'} onChange={(e) => setGender(e.target.value)} className="sr-only" />
                            أنثى
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="age" className={labelClasses}>العمر (سنوات)</label>
                        <input type="number" id="age" value={age} onChange={e => setAge(e.target.value)} className={inputClasses} placeholder="e.g. 25" />
                    </div>
                     <div>
                        <label htmlFor="weight" className={labelClasses}>الوزن (كجم)</label>
                        <input type="number" id="weight" value={weight} onChange={e => setWeight(e.target.value)} className={inputClasses} placeholder="e.g. 70" />
                    </div>
                </div>
                 <div>
                    <label htmlFor="height" className={labelClasses}>الطول (سم)</label>
                    <input type="number" id="height" value={height} onChange={e => setHeight(e.target.value)} className={inputClasses} placeholder="e.g. 175" />
                </div>
                 <div>
                    <label htmlFor="activity" className={labelClasses}>مستوى النشاط</label>
                    <select id="activity" value={activityLevel} onChange={e => setActivityLevel(e.target.value)} className={inputClasses}>
                        {activityLevels.map(level => <option key={level.value} value={level.value}>{level.label}</option>)}
                    </select>
                </div>
                
                <button onClick={calculateCalories} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform active:scale-95">
                    احسب
                </button>

                {calories !== null && (
                    <div className="mt-6 p-4 bg-gray-800 rounded-lg text-center fade-in">
                        <p className="text-gray-400">احتياجك اليومي من السعرات الحرارية:</p>
                        <p className="text-3xl font-bold text-green-400">{calories.toLocaleString()} سعرة حرارية/يوم</p>
                    </div>
                )}
            </div>
        </ConverterScaffold>
    );
};

const BMICalculator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [bmiResult, setBmiResult] = useState<{ bmi: number, category: string, color: string } | null>(null);

    const calculateBMI = () => {
        const weightN = parseFloat(weight);
        const heightN = parseFloat(height);

        if (!weightN || !heightN || weightN <= 0 || heightN <= 0) {
            setBmiResult(null);
            alert('الرجاء إدخال قيم صحيحة للوزن والطول.');
            return;
        }

        const heightInMeters = heightN / 100;
        const bmi = weightN / (heightInMeters * heightInMeters);
        
        let category = '';
        let color = '';
        if (bmi < 18.5) {
            category = 'نقص الوزن';
            color = 'text-blue-400';
        } else if (bmi >= 18.5 && bmi < 24.9) {
            category = 'وزن طبيعي';
            color = 'text-green-400';
        } else if (bmi >= 25 && bmi < 29.9) {
            category = 'زيادة الوزن';
            color = 'text-yellow-400';
        } else {
            category = 'سمنة';
            color = 'text-red-400';
        }
        
        setBmiResult({ bmi: parseFloat(bmi.toFixed(1)), category, color });
    };

    return (
        <ConverterScaffold title="حاسبة مؤشر كتلة الجسم" onBack={onBack}>
            <div className="space-y-4">
                 <div>
                    <label htmlFor="weight" className={labelClasses}>الوزن (كجم)</label>
                    <input type="number" id="weight" value={weight} onChange={e => setWeight(e.target.value)} className={inputClasses} placeholder="e.g. 70" />
                </div>
                 <div>
                    <label htmlFor="height" className={labelClasses}>الطول (سم)</label>
                    <input type="number" id="height" value={height} onChange={e => setHeight(e.target.value)} className={inputClasses} placeholder="e.g. 175" />
                </div>
                <button onClick={calculateBMI} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform active:scale-95">
                    احسب
                </button>
                 {bmiResult !== null && (
                    <div className="mt-6 p-4 bg-gray-800 rounded-lg text-center fade-in">
                        <p className="text-gray-400">مؤشر كتلة الجسم (BMI):</p>
                        <p className={`text-4xl font-bold ${bmiResult.color}`}>{bmiResult.bmi}</p>
                        <p className={`text-lg mt-1 ${bmiResult.color}`}>{bmiResult.category}</p>
                    </div>
                )}
            </div>
        </ConverterScaffold>
    );
};

const TemperatureConverter: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [values, setValues] = useState({ celsius: '', fahrenheit: '', kelvin: '' });

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const valNum = parseFloat(value);
        if (value === '' || isNaN(valNum)) {
            setValues({ celsius: '', fahrenheit: '', kelvin: '' });
            return;
        }

        let c = NaN, f = NaN, k = NaN;
        if (name === 'celsius') {
            c = valNum;
            f = (c * 9/5) + 32;
            k = c + 273.15;
        } else if (name === 'fahrenheit') {
            f = valNum;
            c = (f - 32) * 5/9;
            k = c + 273.15;
        } else if (name === 'kelvin') {
            k = valNum;
            c = k - 273.15;
            f = (c * 9/5) + 32;
        }
        
        const format = (num: number) => parseFloat(num.toPrecision(6)).toString();

        setValues({
            celsius: name === 'celsius' ? value : format(c),
            fahrenheit: name === 'fahrenheit' ? value : format(f),
            kelvin: name === 'kelvin' ? value : format(k),
        });
    };
    
    return (
        <ConverterScaffold title="محول الحرارة" onBack={onBack}>
            <div className="space-y-6">
                <div>
                    <label htmlFor="celsius" className={labelClasses}>درجة مئوية (°C)</label>
                    <input type="number" id="celsius" name="celsius" value={values.celsius} onChange={handleOnChange} className={inputClasses} />
                </div>
                <div>
                    <label htmlFor="fahrenheit" className={labelClasses}>فهرنهايت (°F)</label>
                    <input type="number" id="fahrenheit" name="fahrenheit" value={values.fahrenheit} onChange={handleOnChange} className={inputClasses} />
                </div>
                <div>
                    <label htmlFor="kelvin" className={labelClasses}>كلفن (K)</label>
                    <input type="number" id="kelvin" name="kelvin" value={values.kelvin} onChange={handleOnChange} className={inputClasses} />
                </div>
            </div>
        </ConverterScaffold>
    );
};

// --- Refactored Unit Converters ---

interface Unit { name: string; factor: number; }
interface Units { [key: string]: Unit; }

const unitConvert = (value: string, from: string, to: string, units: Units): string => {
    const valNum = parseFloat(value);
    if (isNaN(valNum)) return '';
    const baseValue = valNum * units[from].factor;
    const result = baseValue / units[to].factor;
    if (result === 0) return '0';
    return parseFloat(result.toPrecision(8)).toString();
};

const BaseUnitConverter: React.FC<{ 
    title: string;
    units: Units;
    initialFrom: string;
    initialTo: string;
    onBack: () => void; 
}> = ({ title, units, initialFrom, initialTo, onBack }) => {
    const [fromValue, setFromValue] = useState('1');
    const [toValue, setToValue] = useState(() => unitConvert('1', initialFrom, initialTo, units));
    const [fromUnit, setFromUnit] = useState(initialFrom);
    const [toUnit, setToUnit] = useState(initialTo);

    const handleValueChange = (val: string, from: 'from' | 'to') => {
        if (from === 'from') {
            setFromValue(val);
            setToValue(unitConvert(val, fromUnit, toUnit, units));
        } else {
            setToValue(val);
            setFromValue(unitConvert(val, toUnit, fromUnit, units));
        }
    };
    
    const handleUnitChange = (unit: string, from: 'from' | 'to') => {
        if (from === 'from') {
            setFromUnit(unit);
            setToValue(unitConvert(fromValue, unit, toUnit, units));
        } else {
            setToUnit(unit);
            setToValue(unitConvert(fromValue, fromUnit, unit, units));
        }
    };

    return (
        <ConverterScaffold title={title} onBack={onBack}>
            <div className="space-y-4">
                 <div>
                    <label className={labelClasses}>من</label>
                    <div className="flex gap-2">
                        <input type="number" value={fromValue} onChange={e => handleValueChange(e.target.value, 'from')} className={inputClasses} />
                        <select value={fromUnit} onChange={e => handleUnitChange(e.target.value, 'from')} className={inputClasses + " w-1/3"}>
                            {Object.entries(units).map(([key, {name}]) => <option key={key} value={key}>{name}</option>)}
                        </select>
                    </div>
                </div>
                 <div>
                    <label className={labelClasses}>إلى</label>
                    <div className="flex gap-2">
                        <input type="number" value={toValue} onChange={e => handleValueChange(e.target.value, 'to')} className={inputClasses} />
                        <select value={toUnit} onChange={e => handleUnitChange(e.target.value, 'to')} className={inputClasses + " w-1/3"}>
                           {Object.entries(units).map(([key, {name}]) => <option key={key} value={key}>{name}</option>)}
                        </select>
                    </div>
                </div>
            </div>
        </ConverterScaffold>
    );
};

const lengthUnits: Units = {
    m: { name: 'متر', factor: 1 },
    km: { name: 'كيلومتر', factor: 1000 },
    cm: { name: 'سنتيمتر', factor: 0.01 },
    mi: { name: 'ميل', factor: 1609.34 },
    ft: { name: 'قدم', factor: 0.3048 },
    in: { name: 'بوصة', factor: 0.0254 },
};
const massUnits: Units = {
    kg: { name: 'كيلوجرام', factor: 1 },
    g: { name: 'جرام', factor: 0.001 },
    lb: { name: 'رطل', factor: 0.453592 },
    oz: { name: 'أونصة', factor: 0.0283495 },
};
const areaUnits: Units = {
    sqm: { name: 'متر مربع', factor: 1 },
    sqkm: { name: 'كم مربع', factor: 1000000 },
    sqft: { name: 'قدم مربع', factor: 0.092903 },
    acre: { name: 'فدان', factor: 4046.86 },
};
const dataUnits: Units = {
    B: { name: 'بايت', factor: 1 },
    KB: { name: 'كيلوبايت', factor: 1024 },
    MB: { name: 'ميجابايت', factor: 1024**2 },
    GB: { name: 'جيجابايت', factor: 1024**3 },
    TB: { name: 'تيرابايت', factor: 1024**4 },
};

const LengthConverter: React.FC<{ onBack: () => void }> = ({ onBack }) => <BaseUnitConverter title="محول الطول" units={lengthUnits} initialFrom="m" initialTo="ft" onBack={onBack} />;
const MassConverter: React.FC<{ onBack: () => void }> = ({ onBack }) => <BaseUnitConverter title="محول الكتلة" units={massUnits} initialFrom="kg" initialTo="lb" onBack={onBack} />;
const AreaConverter: React.FC<{ onBack: () => void }> = ({ onBack }) => <BaseUnitConverter title="محول المساحة" units={areaUnits} initialFrom="sqm" initialTo="sqft" onBack={onBack} />;
const DataConverter: React.FC<{ onBack: () => void }> = ({ onBack }) => <BaseUnitConverter title="محول البيانات" units={dataUnits} initialFrom="MB" initialTo="GB" onBack={onBack} />;

const DiscountCalculator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [price, setPrice] = useState('');
    const [discount, setDiscount] = useState('');

    const priceN = parseFloat(price);
    const discountN = parseFloat(discount);

    let saved = NaN;
    let finalPrice = NaN;

    if (!isNaN(priceN) && !isNaN(discountN) && priceN > 0 && discountN >= 0) {
        saved = priceN * (discountN / 100);
        finalPrice = priceN - saved;
    }
    
    return (
        <ConverterScaffold title="حاسبة الخصم" onBack={onBack}>
            <div className="space-y-4">
                 <div>
                    <label htmlFor="price" className={labelClasses}>السعر الأصلي</label>
                    <input type="number" id="price" value={price} onChange={e => setPrice(e.target.value)} className={inputClasses} placeholder="e.g. 150" />
                </div>
                 <div>
                    <label htmlFor="discount" className={labelClasses}>نسبة الخصم (%)</label>
                    <input type="number" id="discount" value={discount} onChange={e => setDiscount(e.target.value)} className={inputClasses} placeholder="e.g. 25" />
                </div>
                 { !isNaN(finalPrice) && (
                    <div className="mt-6 p-4 bg-gray-800 rounded-lg text-center space-y-2 fade-in">
                        <div>
                            <p className="text-gray-400">السعر النهائي:</p>
                            <p className="text-3xl font-bold text-green-400">{finalPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        </div>
                         <div>
                            <p className="text-gray-400">لقد وفرت:</p>
                            <p className="text-xl font-bold text-yellow-400">{saved.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        </div>
                    </div>
                )}
            </div>
        </ConverterScaffold>
    );
};


const GenericConverter: React.FC<{ name: string; onBack: () => void }> = ({ name, onBack }) => {
    return (
        <ConverterScaffold title={`محول ${name}`} onBack={onBack}>
            <div className="flex-1 flex flex-col justify-center items-center text-center text-gray-400 h-full">
              <p className="text-lg">واجهة محول {name} قيد الإنشاء.</p>
              <p>سيتم تفعيل هذه الميزة في التحديثات القادمة!</p>
            </div>
        </ConverterScaffold>
    );
}

const UnitConverter: React.FC = () => {
    const [activeConverter, setActiveConverter] = useState<string | null>(null);

    const converters = [
      { name: 'العملة', Icon: Icons.CurrencyIcon },
      { name: 'الطول', Icon: Icons.LengthIcon },
      { name: 'الكتلة', Icon: Icons.MassIcon },
      { name: 'المساحة', Icon: Icons.AreaIcon },
      { name: 'الوقت', Icon: Icons.TimeIcon },
      { name: 'المالية', Icon: Icons.FinanceIcon },
      { name: 'البيانات', Icon: Icons.DataIcon },
      { name: 'التاريخ', Icon: Icons.DateIcon },
      { name: 'الخصم', Icon: Icons.DiscountIcon },
      { name: 'الحجم', Icon: Icons.VolumeIcon },
      { name: 'النظام العددي', Icon: Icons.NumberSystemIcon },
      { name: 'السرعة', Icon: Icons.SpeedIcon },
      { name: 'الحرارة', Icon: Icons.TemperatureIcon },
      { name: 'مؤشر كتلة الجسم', Icon: Icons.BMIIcon },
      { name: 'السعرات الحرارية', Icon: Icons.CalorieIcon },
    ];
    
    const handleConverterClick = (name: string) => {
        setActiveConverter(name);
    };

    const handleBack = () => {
        setActiveConverter(null);
    }

    const componentsMap: { [key: string]: React.FC<{ onBack: () => void }> } = {
        'السعرات الحرارية': CalorieCalculator,
        'مؤشر كتلة الجسم': BMICalculator,
        'الحرارة': TemperatureConverter,
        'الطول': LengthConverter,
        'الكتلة': MassConverter,
        'المساحة': AreaConverter,
        'البيانات': DataConverter,
        'الخصم': DiscountCalculator,
    };
    
    if (activeConverter) {
        const ComponentToRender = componentsMap[activeConverter];
        if (ComponentToRender) {
            return <ComponentToRender onBack={handleBack} />;
        }
        return <GenericConverter name={activeConverter} onBack={handleBack} />;
    }

    return (
        <div className="p-6 fade-in">
            <div className="grid grid-cols-3 gap-x-4 gap-y-6">
                {converters.map(({ name, Icon }) => (
                    <div key={name} className="flex flex-col items-center gap-2">
                        <button 
                          onClick={() => handleConverterClick(name)}
                          className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out shadow-md hover:shadow-lg hover:shadow-purple-500/30 hover:scale-110 hover:bg-gradient-to-br from-blue-500 to-purple-600 group transform active:scale-105 active:brightness-90"
                        >
                            <Icon className="w-10 h-10 text-gray-300 transition-transform duration-300 group-hover:scale-110" />
                        </button>
                        <span className="text-sm text-gray-400 text-center">{name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('HOME');

  const renderTabButton = (tab: Tab, label: string) => (
    <button
        onClick={() => setActiveTab(tab)}
        className={`w-1/2 py-4 text-xl font-bold transition-all duration-300 relative transform active:scale-95 ${activeTab === tab ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
    >
        {label}
        {activeTab === tab && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-white rounded-full transition-all"></div>}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-[#1C1C1C] text-white">
      <header className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <nav className="flex items-center justify-around">
            {renderTabButton('HOME', 'HOME')}
            {renderTabButton('NuMIX', 'NuMIX')}
        </nav>
      </header>
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'HOME' && <Calculator />}
        {activeTab === 'NuMIX' && <UnitConverter />}
      </main>
    </div>
  );
};

export default App;