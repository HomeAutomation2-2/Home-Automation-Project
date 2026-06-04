// C++ code
//
void setup()
{
  DDRB |= (1<<1);
  DDRB |= (1<<5);
  DDRD |= (1<<3);
}

void loop()
{
  if(PIND &= (1<<7))
  {
    PORTB &= ~(1<<5); //rosu off
  	PORTD = (1<<3); //verde on
  	PORTB |= (1<<1); //galben on
  }
  else
  {
  	PORTD = 0; //verde off
    PORTB &= ~(1<<1); //galben off
  	PORTB |= (1<<5); //rosu
  }
}